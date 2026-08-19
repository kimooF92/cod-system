import { sanitizeTunisianPhone } from "../validations/order";
import { formatCurrency } from "../utils";

export type WhatsAppTemplateKey = "DERJA_CONFIRM" | "FRENCH_CONFIRM" | "NO_ANSWER_FOLLOWUP" | "DISPATCHED_NOTIFICATION";

export interface WhatsAppTemplateData {
  customerName: string;
  phone: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  governorate: string;
  address?: string;
  trackingCode?: string;
}

export interface GeneratedWhatsAppMessage {
  templateKey: WhatsAppTemplateKey;
  label: string;
  language: string;
  messageText: string;
  url: string;
}

/**
 * Generates localized WhatsApp messages and direct `wa.me` links (FR-26).
 * Pure domain logic (AD-1).
 */
export function generateWhatsAppMessage(
  key: WhatsAppTemplateKey,
  data: WhatsAppTemplateData
): GeneratedWhatsAppMessage {
  const cleanPhone = sanitizeTunisianPhone(data.phone);
  const formattedTotal = formatCurrency(data.totalAmount);
  let messageText = "";
  let label = "";
  let language = "";

  switch (key) {
    case "DERJA_CONFIRM":
      label = "تأكيد الطلب (بالتونسي)";
      language = "Tunisian Derja";
      messageText = `عسلامة ${data.customerName} 👋
نكلموك بخصوص كموندك #${data.orderNumber} متاع:
📦 المنتج: ${data.productName}
🔢 الكمية: ${data.quantity}
💰 المجموع مع التوصيل: ${formattedTotal}
📍 العنوان: ${data.governorate}${data.address ? ` (${data.address})` : ""}

بالله كانك جاهز لتأكيد الإرسال، جاوبنا بـ "نعم أكدلي" باش نبعثوهالك مع الليفرور. شكراً ليك! 🙏`;
      break;

    case "FRENCH_CONFIRM":
      label = "Confirmation de commande (Français)";
      language = "French";
      messageText = `Bonjour ${data.customerName} 👋
Nous vous contactons pour confirmer votre commande #${data.orderNumber} :
📦 Produit : ${data.productName}
🔢 Quantité : ${data.quantity}
💰 Montant total (Livraison incluse) : ${formattedTotal}
📍 Destination : ${data.governorate}${data.address ? ` (${data.address})` : ""}

Merci de répondre par "OUI JE CONFIRME" pour expédier votre colis dès aujourd'hui. Cordialement !`;
      break;

    case "NO_ANSWER_FOLLOWUP":
      label = "حاولنا نكلموك (موش متصل)";
      language = "Tunisian Derja";
      messageText = `عسلامة ${data.customerName} 👋
حاولنا نطلبوك في الهاتف بخصوص كموندك #${data.orderNumber} (${data.productName} بـ ${formattedTotal}) وما تحصلناش عليك.
وقتاش يساعدك نكلموك باش نأكدو الإرسال؟ وإلا جاوبنا لهنا باش نبعثوهالك. شكراً!`;
      break;

    case "DISPATCHED_NOTIFICATION":
      label = "إشعار خروج الطرد مع الليفرور";
      language = "Tunisian Derja";
      messageText = `عسلامة ${data.customerName} 🚚
كموندك #${data.orderNumber} خرجت مع الليفرور وتوصلك في ظرف 24-48 ساعة.
💰 المبلغ المطلوب عند الاستلام: ${formattedTotal}
${data.trackingCode ? `📦 كود التتبع: ${data.trackingCode}\n` : ""}
الرجاء إبقاء هاتفك مشتغل لاستقبال مكالمة الموزع. شكراً لثقتكم!`;
      break;
  }

  const encoded = encodeURIComponent(messageText);
  const url = `https://wa.me/216${cleanPhone}?text=${encoded}`;

  return {
    templateKey: key,
    label,
    language,
    messageText,
    url,
  };
}

/**
 * Returns all available templates for an order
 */
export function getAllWhatsAppTemplates(
  data: WhatsAppTemplateData
): GeneratedWhatsAppMessage[] {
  const keys: WhatsAppTemplateKey[] = [
    "DERJA_CONFIRM",
    "FRENCH_CONFIRM",
    "NO_ANSWER_FOLLOWUP",
    "DISPATCHED_NOTIFICATION",
  ];
  return keys.map((k) => generateWhatsAppMessage(k, data));
}
