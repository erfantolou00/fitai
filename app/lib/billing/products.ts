export type CheckoutProduct = 'new_plan' | 'nutrition';

export interface ProductInfo {
  id: CheckoutProduct;
  name: string;
  description: string;
  priceLabel: string;
  priceAmount: number;
}

export const CHECKOUT_PRODUCTS: Record<CheckoutProduct, ProductInfo> = {
  new_plan: {
    id: 'new_plan',
    name: 'برنامه تمرینی جدید',
    description: 'ساخت برنامه تمرینی شخصی‌سازی‌شده با هوش مصنوعی',
    priceLabel: '۹۹,۰۰۰ تومان',
    priceAmount: 99000,
  },
  nutrition: {
    id: 'nutrition',
    name: 'برنامه تغذیه',
    description: 'برنامه غذایی ایرانی با محاسبه کالری و ماکرو',
    priceLabel: '۴۹,۰۰۰ تومان',
    priceAmount: 49000,
  },
};

export const FREE_TRIAL_DAYS = 30;
