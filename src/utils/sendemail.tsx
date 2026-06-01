import emailjs from "@emailjs/browser";

type SendEmailPayload = {
  name: string;
  phone: string;
  message: string;
};
export async function sendEmail(payload: SendEmailPayload) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  console.log("[ENV]", {
    serviceId,
    templateId,
    publicKey,
  });

 
  if (!serviceId || !templateId || !publicKey) {
    console.error("[sendEmail] Missing EmailJS environment variables", {
      serviceId: Boolean(serviceId),
      templateId: Boolean(templateId),
      publicKey: Boolean(publicKey),
    });
    throw new Error("EmailJS environment variables are missing.");
  }

  console.log("[sendEmail] Sending email with payload", {
    serviceId,
    templateId,
    publicKeyPresent: Boolean(publicKey),
    payload,
  });

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        to_name: "Meta Meca Industries",
        name: payload.name,
        from_name: payload.name,
        phone: payload.phone,
        message: payload.message,
        reply_to: payload.phone,
      },
      {
        publicKey,
      }
    );

    console.log("[sendEmail] EmailJS success", response);
    return response;
  } catch (error) {
    console.error("[sendEmail] EmailJS failed", error);
    throw error;
  }
}