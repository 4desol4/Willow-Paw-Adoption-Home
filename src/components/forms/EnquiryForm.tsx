import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/forms/Fields";
import { useFormState } from "@/hooks/useFormState";
import { enquirySchema, fieldErrors, type EnquiryFormValues } from "@/lib/validation";
import { submitEnquiry } from "@/services/enquiryService";

const validate = (values: EnquiryFormValues) => {
  const result = enquirySchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
};

interface EnquiryFormProps {
  puppy?: { id: string; name: string };
}

/** Idle → focus → valid/invalid → sending → sent. Saved to the `enquiries` table (owner-readable only). */
export function EnquiryForm({ puppy }: EnquiryFormProps) {
  const initial: EnquiryFormValues = {
    name: "",
    email: "",
    phone: "",
    message: puppy ? `Hello, I'd like to know more about ${puppy.name}.` : "",
    website: "",
  };
  const form = useFormState<EnquiryFormValues>(initial, validate);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.values.website !== "") {
      setStatus("success"); // honeypot tripped: look successful, send nothing
      return;
    }
    if (!form.submit()) return;
    setStatus("loading");
    try {
      await submitEnquiry(form.values, puppy?.id ?? null);
      setStatus("success");
      toast.success("Message sent. We'll reply soon.");
    } catch {
      setStatus("idle");
      toast.error("We couldn't send your message. Please try again or use WhatsApp.");
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl bg-leaf/10 p-8">
        <h3 className="font-display text-display-sm">
          Thank you, {form.values.name.split(" ")[0] || "friend"}.
        </h3>
        <p className="mt-2 text-muted">
          We've got your message and will reply by {form.values.email ? "email" : "phone"} as soon
          as we can.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => {
            form.reset({ ...initial, message: "" });
            setStatus("idle");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <TextField label="Your name" autoComplete="name" required {...form.bind("name")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Email" type="email" autoComplete="email" {...form.bind("email")} />
        <TextField
          label="Phone or WhatsApp"
          type="tel"
          autoComplete="tel"
          {...form.bind("phone")}
        />
      </div>
      <TextAreaField label="Message" required rows={5} {...form.bind("message")} />
      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...form.bind("website")} />
        </label>
      </div>
      <Button type="submit" size="lg" state={status === "loading" ? "loading" : "idle"}>
        {status === "loading" ? "Sending" : "Send message"}
      </Button>
    </form>
  );
}
