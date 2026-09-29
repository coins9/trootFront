import WidgetKit
import SwiftUI

// MARK: - Shared data contract
// RN(WidgetBridge)가 App Group UserDefaults 에 아래 JSON 을 써주고, 위젯은 그것만 읽어 렌더한다.
// 위젯은 네트워크/인증을 하지 않는다(단순·안전). 날짜·시간 문자열은 앱이 로케일에 맞춰 미리 만들어 넣는다.
private let appGroupId = "group.com.troot.app"
private let scheduleKey = "widgetSchedule"

struct WidgetScheduleItem: Codable, Identifiable {
  var id: String { "\(time)-\(title)" }
  let time: String     // 예: "14:00"
  let title: String    // 예: 고객명 / 일정 제목
  let sub: String      // 예: "팔 · 시술"
}

struct WidgetSchedule: Codable {
  let updatedAt: Double
  let headline: String        // 예: "오늘 3건"
  let items: [WidgetScheduleItem]
  let empty: String           // 예: "예정된 일정이 없어요"

  static let placeholder = WidgetSchedule(
    updatedAt: 0,
    headline: "오늘 일정",
    items: [
      WidgetScheduleItem(time: "13:00", title: "김민수", sub: "팔 · 시술"),
      WidgetScheduleItem(time: "16:30", title: "이서연", sub: "손목 · 상담"),
    ],
    empty: "예정된 일정이 없어요"
  )

  static func load() -> WidgetSchedule {
    guard
      let defaults = UserDefaults(suiteName: appGroupId),
      let raw = defaults.string(forKey: scheduleKey),
      let data = raw.data(using: .utf8),
      let decoded = try? JSONDecoder().decode(WidgetSchedule.self, from: data)
    else {
      return WidgetSchedule(updatedAt: 0, headline: "오늘 일정", items: [], empty: "예정된 일정이 없어요")
    }
    return decoded
  }
}

// MARK: - Timeline
struct ScheduleEntry: TimelineEntry {
  let date: Date
  let schedule: WidgetSchedule
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> ScheduleEntry {
    ScheduleEntry(date: Date(), schedule: .placeholder)
  }

  func getSnapshot(in context: Context, completion: @escaping (ScheduleEntry) -> Void) {
    completion(ScheduleEntry(date: Date(), schedule: context.isPreview ? .placeholder : WidgetSchedule.load()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<ScheduleEntry>) -> Void) {
    let entry = ScheduleEntry(date: Date(), schedule: WidgetSchedule.load())
    // 앱이 reloadAllTimelines 로 갱신하지만, 안전하게 1시간마다 자체 새로고침도 예약한다.
    let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// MARK: - Colors (앱 다크 테마와 정렬)
private let bg = Color(red: 0.055, green: 0.055, blue: 0.06)
private let gold = Color(red: 0.831, green: 0.659, blue: 0.263)
private let textPrimary = Color.white
private let textSub = Color(red: 0.62, green: 0.62, blue: 0.64)

// MARK: - Views
struct TRootWidgetEntryView: View {
  @Environment(\.widgetFamily) var family
  var entry: Provider.Entry

  private var maxItems: Int { family == .systemSmall ? 2 : 4 }

  var body: some View {
    let items = Array(entry.schedule.items.prefix(maxItems))
    ZStack {
      bg
      VStack(alignment: .leading, spacing: 8) {
        HStack(spacing: 6) {
          Text("T:ROOT")
            .font(.system(size: 11, weight: .heavy))
            .foregroundColor(gold)
          Spacer()
          Text(entry.schedule.headline)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(textSub)
            .lineLimit(1)
        }

        if items.isEmpty {
          Spacer()
          Text(entry.schedule.empty)
            .font(.system(size: 12))
            .foregroundColor(textSub)
            .frame(maxWidth: .infinity, alignment: .center)
          Spacer()
        } else {
          VStack(alignment: .leading, spacing: family == .systemSmall ? 6 : 8) {
            ForEach(items) { item in
              HStack(alignment: .top, spacing: 8) {
                Text(item.time)
                  .font(.system(size: 12, weight: .bold))
                  .foregroundColor(gold)
                  .frame(width: 42, alignment: .leading)
                VStack(alignment: .leading, spacing: 1) {
                  Text(item.title)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(textPrimary)
                    .lineLimit(1)
                  if !item.sub.isEmpty && family != .systemSmall {
                    Text(item.sub)
                      .font(.system(size: 10.5))
                      .foregroundColor(textSub)
                      .lineLimit(1)
                  }
                }
                Spacer(minLength: 0)
              }
            }
          }
          Spacer(minLength: 0)
        }
      }
      .padding(14)
    }
    .widgetURL(URL(string: "troot://calendar"))
  }
}

@main
struct TRootWidget: Widget {
  let kind = "TRootWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      if #available(iOS 17.0, *) {
        TRootWidgetEntryView(entry: entry)
          .containerBackground(bg, for: .widget)
      } else {
        TRootWidgetEntryView(entry: entry)
          .padding(0)
          .background(bg)
      }
    }
    .configurationDisplayName("T:ROOT 일정")
    .description("오늘과 다가오는 예약을 한눈에 봅니다.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
