import React, { useState, useEffect } from 'react';
import '../../css/Contact.css';
import { portfolioData } from '../../data/portfolioData';
import { supabase } from '../../supabaseClient';

const Contact = ({ session }) => {
    const [contactData, setContactData] = useState(portfolioData.contact);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch and Sync Contact Data from a dedicated 'contact_info' table
    useEffect(() => {
        const fetchAndSyncContact = async () => {
            try {
                // 1. Fetch from 'contact_info' table
                let { data, error } = await supabase
                    .from('contact_info')
                    .select('*')
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching contact info:", error);
                }

                // 2. Check if DB has data. If not, seed it with local data.
                if (!data) {
                    console.log("No data in 'contact_info'. Importing local data...");
                    const initialData = portfolioData.contact;
                    const dbPayload = {
                        title: initialData.title,
                        subtitle: initialData.subtitle,
                        description: initialData.description,
                        email: initialData.email,
                        phone: initialData.phone,
                        linkedin: initialData.socials?.linkedin || "",
                        github: initialData.socials?.github || "",
                        updated_at: new Date().toISOString()
                    };

                    const { data: insertedData, error: upsertError } = await supabase
                        .from('contact_info')
                        .upsert(dbPayload)
                        .select()
                        .single();

                    if (!upsertError && insertedData) {
                        setContactData(initialData);
                    } else {
                        console.error("Failed to seed contact info:", upsertError);
                    }
                } else {
                    // 3. DB has data, un-flatten it for state (reconstruct nested 'socials')
                    setContactData({
                        title: data.title,
                        subtitle: data.subtitle,
                        description: data.description,
                        email: data.email,
                        phone: data.phone,
                        socials: {
                            linkedin: data.linkedin || "",
                            github: data.github || ""
                        }
                    });
                }
            } catch (err) {
                console.error("Supabase connection error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSyncContact();
    }, []);

    const handleSave = async () => {
        try {
            const dbPayload = {
                title: contactData.title,
                subtitle: contactData.subtitle,
                description: contactData.description,
                email: contactData.email,
                phone: contactData.phone,
                linkedin: contactData.socials.linkedin,
                github: contactData.socials.github,
                updated_at: new Date().toISOString()
            };

            const { data: existing } = await supabase.from('contact_info').select('id').maybeSingle();
            if (existing) {
                dbPayload.id = existing.id;
            } else {
            }

            const { error: upsertError } = await supabase
                .from('contact_info')
                .upsert(dbPayload);

            if (upsertError) throw upsertError;

            setIsEditing(false);
            alert("Contact details saved to 'contact_info' table!");
        } catch (err) {
            console.error("Save Error:", err);
            let msg = "Failed to save contacts: " + err.message;
            if (err.message?.includes("does not exist") || err.code === '42P01') {
                msg = "DATABASE ERROR: The 'contact_info' table does not exist. Please run the Create Table SQL.";
            } else if (err.message?.includes("security policy") || err.message?.includes("permission denied")) {
                msg = "PERMISSION ERROR: Row Level Security (RLS) is blocking this request. Please run: 'alter table contact_info disable row level security;' in Supabase.";
            } else if (err.message?.includes("contact_info")) {
                msg = "Database Error involving 'contact_info': " + err.message;
            }
            alert(msg);
        }
    };

    const handleChange = (field, value) => {
        setContactData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform, value) => {
        setContactData(prev => ({
            ...prev,
            socials: { ...prev.socials, [platform]: value }
        }));
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [sending, setSending] = useState(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert("Message sent successfully! I'll get back to you soon.");
            setFormData({ name: "", email: "", phone: "", message: "" });
        } catch (err) {
            console.error("Error sending message:", err);
            let msg = "Failed to send message.";
            if (err.message?.includes('contact_messages')) {
                msg = "System Error: The 'contact_messages' table does not exist. Please check the implementation notes.";
            }
            alert(msg);
        } finally {
            setSending(false);
        }
    };

    if (loading) return null;

    return (
        <section className="section contact">
            <div className="container">
                <div className="contact-header-inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="section-title">
                        {contactData.title.split(' ')[0]} <span>{contactData.title.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    {session && (
                        <button
                            className="btn btn-outline"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Cancel Edit" : "Edit Contact"}
                        </button>
                    )}
                </div>

                {isEditing && (
                    <div className="contact-editor" style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #333' }}>
                        <h3 style={{ marginBottom: '15px' }}>Edit Contact Details</h3>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Section Title</label>
                            <input
                                type="text"
                                value={contactData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Subtitle</label>
                            <input
                                type="text"
                                value={contactData.subtitle}
                                onChange={(e) => handleChange('subtitle', e.target.value)}
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Description Text</label>
                            <textarea
                                value={contactData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows="3"
                                style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                            />
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Email Address</label>
                                <input
                                    type="text"
                                    value={contactData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Phone Number</label>
                                <input
                                    type="text"
                                    value={contactData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                                />
                            </div>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>LinkedIn URL</label>
                                <input
                                    type="text"
                                    value={contactData.socials.linkedin}
                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>GitHub URL</label>
                                <input
                                    type="text"
                                    value={contactData.socials.github}
                                    onChange={(e) => handleSocialChange('github', e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' }}
                                />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '20px', width: '100%' }}
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    </div>
                )}

                <div className="contact-container">
                    <div className="contact-info">
                        <h3>{contactData.subtitle}</h3>
                        <p>{contactData.description}</p>
                        <div className="contact-details">
                            <a href={`mailto:${contactData.email}`} className="contact-email">{contactData.email}</a>
                            <a href={`tel:${contactData.phone}`} className="contact-phone">{contactData.phone}</a>
                        </div>

                        <div className="social-links">
                            <a href={contactData.socials.linkedin} className="social-icon" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                </svg>
                            </a>
                            <a href={contactData.socials.github} className="social-icon" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.63-.33 2.47-.33c.84 0 1.68.11 2.47.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSendMessage}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                required
                                value={formData.name}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="message"
                                placeholder="Message"
                                rows="5"
                                required
                                value={formData.message}
                                onChange={handleFormChange}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={sending}>
                            {sending ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
