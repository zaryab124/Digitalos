export interface CopilotGenerationResult {
  type: "PRODUCT_DESCRIPTION" | "MARKETING_POST" | "OFFER_STRATEGY";
  english: string;
  urdu: string;
  romanUrdu: string;
  tips?: string[];
}

export function generateProductDescription(
  name: string,
  category = "general",
  price?: number
): CopilotGenerationResult {
  const priceText = price ? `Available at the verified price of PKR ${price.toLocaleString()}.` : "Available at wholesale local rates.";

  const english = `Premium quality ${name} sourced for authentic performance and durability. Tested and verified for Jampur conditions with full after-sales support. ${priceText}`;
  const urdu = `اعلیٰ اور مستند کوالٹی ${name}۔ پائیدار اور معیاری، جام پور اور گردونواح کے کسٹمرز کیلئے خصوصی دستیاب۔ ${price ? `${price} روپے کی تصدیق شدہ قیمت پر۔` : ""}`;
  const romanUrdu = `Aala quality aur verified ${name}. Jampur aur qareebi ilaqon ke liye behtareen aur reliable. ${price ? `Sirf PKR ${price} mein dastyab.` : ""}`;

  return {
    type: "PRODUCT_DESCRIPTION",
    english,
    urdu,
    romanUrdu,
    tips: [
      "Add exact warranty duration (e.g. 1 Year Official Warranty).",
      "Mention if home delivery across Jampur is free.",
    ],
  };
}

export function generateMarketingCampaign(
  businessName: string,
  category = "general",
  offerDetail = "Special discount on all items"
): CopilotGenerationResult {
  const english = `📢 Special Announcement from ${businessName}!\n\nWe are delighted to bring you exclusive deals: ${offerDetail}.\nOrder online via Jampur Digital OS or visit our shop. Fast doorstep delivery available across Jampur!`;

  const urdu = `📢 ${businessName} کی جانب سے خصوصی خوشخبری!\n\nہم اپنے معزز گاہکوں کیلئے لا رہے ہیں شاندار رعایت: ${offerDetail}۔\nجام پور ڈیجیٹل او ایس پر آن لائن آرڈر کریں یا دکان پر تشریف لائیں۔ گھر کی دہلیز تک تیز ترین ڈلیوری دستیاب ہے۔`;

  const romanUrdu = `📢 ${businessName} ki janib se shandar offer!\n\nHum laye hain apke liye: ${offerDetail}!\nJampur Digital OS se online order karein ya shop visit karein. Fast home delivery dastyab hai!`;

  return {
    type: "MARKETING_POST",
    english,
    urdu,
    romanUrdu,
    tips: [
      "Share this message directly on your shop's WhatsApp Status and community groups.",
      "Attach your JDOS store link so customers can order with 1-click.",
    ],
  };
}

export function suggestPromotionalOffer(category: string): CopilotGenerationResult {
  const suggestions: Record<string, { en: string; ur: string; roman: string }> = {
    electronics: {
      en: "Summer Solar Super Saver: Flat 10% OFF on Inverter & Battery bundles with free wiring inspection.",
      ur: "گرمیوں کا سولر پیکیج: انورٹر اور ٹیوبلر بیٹری پیکیج پر 10 فیصد فلیٹ رعایت اور مفت فٹنگ معائنہ۔",
      roman: "Garmiyon ka Solar Package: Inverter aur Battery bundle par flat 10% discount aur free inspection.",
    },
    pharmacies: {
      en: "Family Wellness Deal: Flat 5% OFF on prescription orders above PKR 1,500 with instant 30-min courier delivery.",
      ur: "فیملی ہیلتھ ڈیل: 1500 روپے سے زائد ادویات کے آرڈر پر 5 فیصد رعایت اور 30 منٹ میں فری ہوم ڈلیوری۔",
      roman: "Family Health Deal: PKR 1,500 se zyada dawaion par 5% discount aur 30 mins mein doorstep delivery.",
    },
    grocery: {
      en: "Monthly Rashan Bumper Offer: Free 1kg Sugar with every grocery cart over PKR 5,000.",
      ur: "ماہانہ راشن آفر: 5000 روپے کے کریانہ خریداری پر 1 کلو چینی بالکل مفت اور ہوم ڈلیوری۔",
      roman: "Mahana Rashan Offer: PKR 5,000 ki grocery par 1kg cheeni muft aur rider delivery.",
    },
  };

  const selected = suggestions[category] || {
    en: "Seasonal Clearance: Flat 10% discount on all store items for verified JDOS customers.",
    ur: "سیزنل آفر: تمام اشیاء پر 10 فیصد خصوصی رعایت۔",
    roman: "Seasonal Deal: Tamam items par flat 10% discount verified JDOS customers ke liye.",
  };

  return {
    type: "OFFER_STRATEGY",
    english: selected.en,
    urdu: selected.ur,
    romanUrdu: selected.roman,
  };
}
