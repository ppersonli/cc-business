export type Locale = 'en' | 'pt' | 'es';

export interface TranslationKeys {
  // App
  appName: string;
  tagline: string;

  // Navigation
  tabCalculator: string;
  tabHistory: string;

  // Calculator
  costOfGoods: string;
  sellingPrice: string;
  shippingCost: string;
  platform: string;
  quantity: string;
  calculate: string;
  clear: string;

  // Results
  results: string;
  revenue: string;
  totalCost: string;
  totalFees: string;
  profit: string;
  margin: string;
  roi: string;
  feeBreakdown: string;
  perUnit: string;
  saveToHistory: string;

  // Platforms
  platformEtsy: string;
  platformAmazon: string;
  platformShopify: string;
  platformTiktok: string;

  // History
  history: string;
  noHistory: string;
  deleteEntry: string;
  clearHistory: string;
  savedOn: string;

  // General
  currency: string;
  positive: string;
  negative: string;
  darkMode: string;
}

const translations: Record<Locale, TranslationKeys> = {
  en: {
    appName: 'SellSmart',
    tagline: 'E-Commerce Seller Research',
    tabCalculator: 'Calculator',
    tabHistory: 'History',
    costOfGoods: 'Cost of Goods',
    sellingPrice: 'Selling Price',
    shippingCost: 'Shipping Cost',
    platform: 'Platform',
    quantity: 'Quantity',
    calculate: 'Calculate Profit',
    clear: 'Clear',
    results: 'Results',
    revenue: 'Revenue',
    totalCost: 'Total Cost',
    totalFees: 'Platform Fees',
    profit: 'Net Profit',
    margin: 'Profit Margin',
    roi: 'ROI',
    feeBreakdown: 'Fee Breakdown',
    perUnit: 'per unit',
    saveToHistory: 'Save to History',
    platformEtsy: 'Etsy',
    platformAmazon: 'Amazon',
    platformShopify: 'Shopify',
    platformTiktok: 'TikTok Shop',
    history: 'Research History',
    noHistory: 'No saved research yet.',
    deleteEntry: 'Delete',
    clearHistory: 'Clear All',
    savedOn: 'Saved on',
    currency: '$',
    positive: 'Profitable',
    negative: 'Loss',
    darkMode: 'Dark Mode',
  },
  pt: {
    appName: 'SellSmart',
    tagline: 'Pesquisa para Vendedores E-Commerce',
    tabCalculator: 'Calculadora',
    tabHistory: 'Histórico',
    costOfGoods: 'Custo do Produto',
    sellingPrice: 'Preço de Venda',
    shippingCost: 'Custo de Envio',
    platform: 'Plataforma',
    quantity: 'Quantidade',
    calculate: 'Calcular Lucro',
    clear: 'Limpar',
    results: 'Resultados',
    revenue: 'Receita',
    totalCost: 'Custo Total',
    totalFees: 'Taxas da Plataforma',
    profit: 'Lucro Líquido',
    margin: 'Margem de Lucro',
    roi: 'ROI',
    feeBreakdown: 'Detalhamento de Taxas',
    perUnit: 'por unidade',
    saveToHistory: 'Salvar no Histórico',
    platformEtsy: 'Etsy',
    platformAmazon: 'Amazon',
    platformShopify: 'Shopify',
    platformTiktok: 'TikTok Shop',
    history: 'Histórico de Pesquisa',
    noHistory: 'Nenhuma pesquisa salva.',
    deleteEntry: 'Excluir',
    clearHistory: 'Limpar Tudo',
    savedOn: 'Salvo em',
    currency: 'R$',
    positive: 'Lucrativo',
    negative: 'Prejuízo',
    darkMode: 'Modo Escuro',
  },
  es: {
    appName: 'SellSmart',
    tagline: 'Investigación para Vendedores E-Commerce',
    tabCalculator: 'Calculadora',
    tabHistory: 'Historial',
    costOfGoods: 'Costo del Producto',
    sellingPrice: 'Precio de Venta',
    shippingCost: 'Costo de Envío',
    platform: 'Plataforma',
    quantity: 'Cantidad',
    calculate: 'Calcular Ganancia',
    clear: 'Limpiar',
    results: 'Resultados',
    revenue: 'Ingresos',
    totalCost: 'Costo Total',
    totalFees: 'Comisiones de Plataforma',
    profit: 'Ganancia Neta',
    margin: 'Margen de Ganancia',
    roi: 'ROI',
    feeBreakdown: 'Detalle de Comisiones',
    perUnit: 'por unidad',
    saveToHistory: 'Guardar en Historial',
    platformEtsy: 'Etsy',
    platformAmazon: 'Amazon',
    platformShopify: 'Shopify',
    platformTiktok: 'TikTok Shop',
    history: 'Historial de Investigación',
    noHistory: 'Sin investigaciones guardadas.',
    deleteEntry: 'Eliminar',
    clearHistory: 'Limpiar Todo',
    savedOn: 'Guardado el',
    currency: '$',
    positive: 'Rentable',
    negative: 'Pérdida',
    darkMode: 'Modo Oscuro',
  },
};

export function getTranslation(locale: Locale): TranslationKeys {
  return translations[locale] || translations.en;
}

export const SUPPORTED_LOCALES: Locale[] = ['en', 'pt', 'es'];

export function detectLocale(): Locale {
  const lang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.includes(lang as Locale)) return lang as Locale;
  return 'en';
}
