// src/lib/sendEmail.ts
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { ses } from "./ses";

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
) {
  try {
    const params = {
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: htmlContent } },
      },
      Source: "abraham.ayegba@virtualservicesgroup.co.uk",
    };

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    console.log("Email sent:", result.MessageId);
    return result;
  } catch (err: any) {
    console.error("SES send error:", err.message);
    throw new Error("Failed to send email via SES");
  }
}
