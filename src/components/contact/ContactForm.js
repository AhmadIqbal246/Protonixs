"use client";

import { useState } from "react";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
    const [form, setForm] = useState(initialForm);
    const [honeypot, setHoneypot] = useState("");
    const [status, setStatus] = useState({ loading: false, error: "", success: false });

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus({ loading: true, error: "", success: false });
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, website: honeypot, source: "journal_contact" }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Message could not be sent.");
            }
            setForm(initialForm);
            setHoneypot("");
            setStatus({ loading: false, error: "", success: true });
        } catch (error) {
            setStatus({
                loading: false,
                error: error.message || "Message could not be sent. Please email us directly.",
                success: false,
            });
        }
    }

    function update(field) {
        return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
    }

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            <div className="honeypot" aria-hidden="true">
                <label htmlFor="website-check">Leave this field empty</label>
                <input
                    autoComplete="off"
                    id="website-check"
                    name="website"
                    onChange={(event) => setHoneypot(event.target.value)}
                    tabIndex={-1}
                    value={honeypot}
                />
            </div>
            <label>
                Your name
                <input className="field" autoComplete="name" maxLength={100} name="name" onChange={update("name")} required value={form.name} />
            </label>
            <label>
                Email address
                <input className="field" autoComplete="email" maxLength={200} name="email" onChange={update("email")} required type="email" value={form.email} />
            </label>
            <label>
                Subject
                <input className="field" maxLength={150} name="subject" onChange={update("subject")} required value={form.subject} />
            </label>
            <label>
                Message
                <textarea className="field" maxLength={5000} minLength={10} name="message" onChange={update("message")} required value={form.message} />
            </label>
            {status.error ? <p className="form-error" role="alert">{status.error}</p> : null}
            {status.success ? <p className="form-success" role="status">Your message has been sent.</p> : null}
            <button className="button" disabled={status.loading} type="submit">
                {status.loading ? "Sending…" : "Send message"}
            </button>
        </form>
    );
}
