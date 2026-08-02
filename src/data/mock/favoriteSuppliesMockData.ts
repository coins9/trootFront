import { MOCK_SUPPLIES } from './supplyMockData';
import { TattooSupply } from '../../domain/entities/supplyTypes';

const FAVORITE_SUPPLY_IDS = new Set<string>([
  'sup1', 'sup2', 'sup4', 'sup5', 'sup7', 'sup9', 'sup11', 'sup13',
]);

export const MOCK_FAVORITE_SUPPLIES: TattooSupply[] = MOCK_SUPPLIES
  .filter((s) => FAVORITE_SUPPLY_IDS.has(s.id))
  .map((s) => ({ ...s, isBookmarked: true }));
