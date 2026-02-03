import React, { useState, useEffect } from 'react';
import '../../css/About.css';
import { portfolioData } from '../../data/portfolioData';
import { supabase } from '../../supabaseClient';

const About = ({ session }) => {
    const [isEditing, setIsEditing] = useState(false);

    // Default initial state
    const [aboutData, setAboutData] = useState({
        title: "About Me",
        subtitle: "More than just code.",
        // Default text if DB is empty
        description: [
            "I'm a passionate Full Stack Developer based in India. I enjoy turning complex problems into simple, beautiful, and intuitive digital experiences.",
            "With a focus on building scalable and high-performance applications, I specialize in the modern web ecosystem, transforming ideas into functional reality through clean code and user-centric design."
        ],
        skills: [
            "JavaScript", "React.js", "Node.js", "HTML5", "CSS3",
            "Git", "GitHub", "UI/UX Design", "Responsive Design", "API Integration", "Supabase"
        ],
        resumes: portfolioData.hero.resumes || []
    });

    useEffect(() => {
        const fetchAndSyncAbout = async () => {
            try {
                // 1. Fetch from 'about_info' table
                let { data, error } = await supabase
                    .from('about_info')
                    .select('*')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching about info:", error);
                }

                // 2. Check if DB has data. If not, seed it with local data.
                if (!data) {
                    console.log("No data in 'about_info'. Importing local data...");

                    const initialPayload = {
                        title: "About Me", // Default title if not in data
                        subtitle: "More than just code.",
                        description: [
                            "I'm a passionate Full Stack Developer based in India. I enjoy turning complex problems into simple, beautiful, and intuitive digital experiences.",
                            "With a focus on building scalable and high-performance applications, I specialize in the modern web ecosystem, transforming ideas into functional reality through clean code and user-centric design."
                        ],
                        skills: [
                            "JavaScript", "React.js", "Node.js", "HTML5", "CSS3",
                            "Git", "GitHub", "UI/UX Design", "Responsive Design", "API Integration", "Supabase"
                        ],
                        resumes: portfolioData.hero.resumes || [],
                        updated_at: new Date().toISOString()
                    };

                    const { data: insertedData, error: upsertError } = await supabase
                        .from('about_info')
                        .insert(initialPayload)
                        .select()
                        .single();

                    if (!upsertError && insertedData) {
                        setAboutData({
                            id: insertedData.id,
                            title: insertedData.title,
                            subtitle: insertedData.subtitle,
                            description: insertedData.description || [],
                            skills: insertedData.skills || [],
                            resumes: insertedData.resumes || []
                        });
                    } else {
                        console.error("Failed to seed about info:", upsertError);
                    }
                } else {
                    // 3. DB has data, use it
                    setAboutData({
                        id: data.id,
                        title: data.title,
                        subtitle: data.subtitle,
                        description: data.description || [],
                        skills: data.skills || [],
                        resumes: data.resumes || []
                    });
                }
            } catch (err) {
                console.error("Supabase connection error:", err);
            }
        };

        fetchAndSyncAbout();
    }, []);

    const handleChange = (field, value) => {
        setAboutData(prev => ({ ...prev, [field]: value }));
    };

    // Handle separate resume logic
    const handleAddResume = () => {
        setAboutData(prev => ({
            ...prev,
            resumes: [...prev.resumes, { label: "New Resume", url: "" }]
        }));
    };

    const handleRemoveResume = (index) => {
        setAboutData(prev => ({
            ...prev,
            resumes: prev.resumes.filter((_, i) => i !== index)
        }));
    };

    const updateResume = (index, field, value) => {
        const updated = [...aboutData.resumes];
        updated[index] = { ...updated[index], [field]: value };
        setAboutData(prev => ({ ...prev, resumes: updated }));
    };

    const handleFileUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                alert("Please upload a PDF file!");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large! Max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                updateResume(index, 'url', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        console.log("Saving about section to Supabase...");
        try {
            // Prepare payload
            const dbPayload = {
                // If we retrieved an ID previously, we should use it. 
                // For a single config row, we often either hardcode ID 1 or fetch existing.
                title: aboutData.title,
                subtitle: aboutData.subtitle,
                description: aboutData.description,
                skills: aboutData.skills,
                resumes: aboutData.resumes,
                updated_at: new Date().toISOString()
            };

            // Use the ID from our state to update the correct row
            if (aboutData.id) {
                dbPayload.id = aboutData.id;
            } else {
                // Fallback: Try to find latest existing just in case
                const { data: existing } = await supabase
                    .from('about_info')
                    .select('id')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (existing) dbPayload.id = existing.id;
            }

            // 2. Perform Upsert
            const { error: upsertError } = await supabase
                .from('about_info')
                .upsert(dbPayload);

            if (upsertError) throw upsertError;

            setIsEditing(false);
            alert("About section saved to 'about_info' table!");
        } catch (err) {
            console.error("Save Error:", err);
            let msg = "Failed to save: " + err.message;
            if (err.message?.includes("does not exist") || err.code === '42P01') {
                msg = "DATABASE ERROR: The 'about_info' table does not exist. Please run the Create Table SQL.";
            } else if (err.message?.includes("security policy") || err.message?.includes("permission denied")) {
                msg = "PERMISSION ERROR: Row Level Security (RLS) is blocking this request. Please run: 'alter table about_info disable row level security;' in Supabase.";
            }
            alert(msg);
        }
    };

    return (
        <section className="section about">
            <div className="container">
                <div className="section-header-inline">
                    {/* Parse Title for formatting if needed, simply splitting by space for 'span' styling */}
                    <h2 className="section-title">
                        {aboutData.title.split(' ')[0]} <span>{aboutData.title.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    {session && (
                        <button
                            className="btn btn-outline"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Cancel Edit" : "Edit About"}
                        </button>
                    )}
                </div>

                <div className="about-content">
                    {isEditing ? (
                        <div className="about-editor-form" style={{ width: '100%', marginBottom: '2rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ color: '#888' }}>Section Title</label>
                                <input
                                    className="edit-input"
                                    style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
                                    value={aboutData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ color: '#888' }}>Subtitle</label>
                                <input
                                    className="edit-input"
                                    style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
                                    value={aboutData.subtitle}
                                    onChange={(e) => handleChange('subtitle', e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ color: '#888' }}>Description (Paragraphs separated by empty lines)</label>
                                <textarea
                                    rows="6"
                                    style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
                                    value={aboutData.description.join('\n\n')}
                                    onChange={(e) => handleChange('description', e.target.value.split('\n\n'))}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ color: '#888' }}>Skills (Comma separated)</label>
                                <textarea
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
                                    value={aboutData.skills.join(', ')}
                                    onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()))}
                                />
                            </div>

                            <label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Resumes / CVs</label>
                            <div className="multi-resume-editor">
                                {aboutData.resumes.map((res, index) => (
                                    <div key={index} className="resume-edit-row">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Web Dev)"
                                            value={res.label}
                                            onChange={(e) => updateResume(index, 'label', e.target.value)}
                                            className="edit-input"
                                        />
                                        <label className="file-input-label mini">
                                            <span>{res.url ? "📄 Change PDF" : "📤 Upload PDF"}</span>
                                            <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, index)} hidden />
                                        </label>
                                        <button className="delete-btn-sm" onClick={() => handleRemoveResume(index)}>&times;</button>
                                    </div>
                                ))}
                                <div className="editor-footer">
                                    <button className="btn btn-outline btn-sm" onClick={handleAddResume}>+ Add Resume</button>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={handleSave}>Save Everything</button>
                        </div>
                    ) : (
                        <>
                            <div className="about-text">
                                <h3>{aboutData.subtitle}</h3>
                                {aboutData.description.map((para, index) => (
                                    <p key={index}>{para}</p>
                                ))}

                                <div className="about-actions">
                                    <div className="resume-list">
                                        {aboutData.resumes.map((res, index) => (
                                            res.url && (
                                                <a key={index} href={res.url} download={`${res.label}_Resume.pdf`} className="btn btn-primary resume-btn">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
                                                        <path fill="currentColor" d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-1v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-4h2v4h14v-4h2z" />
                                                    </svg>
                                                    {res.label}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="about-skills">
                                <h3>My Tech Stack</h3>
                                <div className="skills-grid">
                                    {aboutData.skills.map((skill, index) => (
                                        <div key={index} className="skill-item">
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;
