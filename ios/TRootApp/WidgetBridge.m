#import <React/RCTBridgeModule.h>

// Swift 로 구현된 WidgetBridge 모듈을 RN 에 노출한다.
@interface RCT_EXTERN_MODULE(WidgetBridge, NSObject)

RCT_EXTERN_METHOD(setSchedule:(NSString *)json)
RCT_EXTERN_METHOD(clear)

@end
