import { bold, fmt, italic, link } from 'telegraf/format'

import type {
  Element,
  FreeGame,
  KeyImage,
  PromotionalOffer,
  Promotions,
} from './freegames.interface.js'
import { Markup } from 'telegraf'

const ProductStoreUrl = process.env.PRODUCT_STORE_URL ?? ''

export const maximumDiscountPercentage =
  (discountPercentage: number) => (promotion: PromotionalOffer) =>
    promotion.discountSetting.discountPercentage <= discountPercentage

export function freeOffers({
  promotionalOffers,
  upcomingPromotionalOffers,
}: Promotions) {
  return {
    current: promotionalOffers
      .flatMap((container) => container.promotionalOffers)
      .filter(maximumDiscountPercentage(0)),
    upcoming: upcomingPromotionalOffers
      .flatMap((container) => container.promotionalOffers)
      .filter(maximumDiscountPercentage(0)),
  }
}

const wideImage = ({ type }: KeyImage) =>
  type === 'DieselStoreFrontWide' || type === 'OfferImageWide'

const imageUrl = (images: KeyImage[]) => images.find(wideImage)?.url || ''

export function toFreeGame(element: Element): FreeGame | null {
  if (!element.promotions) {
    return null
  }

  const {
    current: [currentOffer],
    upcoming: [upcomingOffer],
  } = freeOffers(element.promotions)

  if (!currentOffer && !upcomingOffer) {
    return null
  }

  return {
    state: currentOffer ? 'active' : 'upcoming',
    title: element.title,
    slug: element.productSlug ?? element.offerMappings?.[0].pageSlug,
    photo: imageUrl(element.keyImages),
    start: currentOffer?.startDate || upcomingOffer?.startDate,
    end: currentOffer?.endDate || upcomingOffer?.endDate,
  }
}

export function freeGameOnly(elements: Element[]) {
  return elements.reduce((games, element) => {
    const freeGame = toFreeGame(element)
    return freeGame ? [...games, freeGame] : games
  }, [] as FreeGame[])
}

export const activeCompareFn = (a: FreeGame, b: FreeGame) =>
  a.state === 'active' ? -1 : b.state === 'active' ? 1 : 0

export const formatDate = (stringDate: string): string =>
  new Date(stringDate).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })

export function gameCard(game: FreeGame) {
  const startDate = formatDate(game.start)
  const endDate = formatDate(game.end)
  const start = game.state === 'active' ? 'Agora' : startDate
  const caption = fmt`${bold`${game.title.toUpperCase()}`}
${italic`${start} - ${endDate}`}
`

  const urlPath = game.slug ? `p/${game.slug}` : 'free-games'
  const url = `${ProductStoreUrl}/${urlPath}`
  const buttonText =
    game.state === 'active' ? `JÁ DISPONÍVEL` : 'EM BREVE'
  const keyboard = Markup.inlineKeyboard([Markup.button.url(buttonText, url)])

  return {
    caption,
    keyboard,
  }
}
