export interface Catalog {
  searchStore: SearchStore;
}

export interface SearchStore {
  elements: Element[];
  paging: Paging;
}

export interface Element {
  title: string;
  id: string;
  namespace: string;
  description: string;
  effectiveDate: string;
  offerType: string;
  expiryDate: string | null;
  viewableDate: string;
  status: string;
  isCodeRedemptionOnly: boolean;
  keyImages: KeyImage[];
  seller: Seller;
  productSlug: string | null;
  urlSlug: string;
  url: string | null;
  items: Item[];
  customAttributes: CustomAttribute[];
  categories: Category[];
  tags: Tag[];
  catalogNs: CatalogNs;
  offerMappings: OfferMapping[];
  price: Price;
  promotions: Promotions | null;
}

export interface KeyImage {
  type: string;
  url: string;
}

export interface Seller {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  namespace: string;
}

export interface CustomAttribute {
  key: string;
  value: string;
}

export interface Category {
  path: string;
}

export interface Tag {
  id: string;
}

export interface CatalogNs {
  mappings: Mapping[] | null;
}

export interface Mapping {
  pageSlug: string;
  pageType: string;
}

export interface OfferMapping {
  pageSlug: string;
  pageType: string;
}

export interface Price {
  totalPrice: TotalPrice;
  lineOffers: LineOffer[];
}

export interface TotalPrice {
  discountPrice: number;
  originalPrice: number;
  voucherDiscount: number;
  discount: number;
  currencyCode: string;
  currencyInfo: CurrencyInfo;
  fmtPrice: FmtPrice;
}

export interface CurrencyInfo {
  decimals: number;
}

export interface FmtPrice {
  originalPrice: string;
  discountPrice: string;
  intermediatePrice: string;
}

export interface LineOffer {
  appliedRules: any[];
}

export interface Promotions {
  promotionalOffers: PromotionalOfferContainer[];
  upcomingPromotionalOffers: PromotionalOfferContainer[];
}

export interface PromotionalOfferContainer {
  promotionalOffers: PromotionalOffer[];
}

export interface PromotionalOffer {
  startDate: string;
  endDate: string;
  discountSetting: DiscountSetting;
}

export interface DiscountSetting {
  discountType: string;
  discountPercentage: number;
}

export interface Paging {
  count: number;
  total: number;
}

export interface FreeGamesPromotionsData {
  Catalog: Catalog;
}

export interface FreeGamesPromotionsResponse {
  data: FreeGamesPromotionsData;
}

export interface FreeGame {
  state: 'active' | 'upcoming';
  title: string;
  slug: string | null;
  photo: string;
  start: string;
  end: string;
}
