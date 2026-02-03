import React, { useState, useEffect } from 'react';
import '../../css/About.css';
import { portfolioData } from '../../data/portfolioData';
import { supabase } from '../../supabaseClient';

const About = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [aboutData, setAboutData] = useState({
        resumes: portfolioData.hero.resumes || []
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase.from('profiles').select('resumes').maybeSingle();
            if (data && data.resumes) {
                setAboutData({ resumes: data.resumes });
            }
        };
        fetchData();
    }, []);

    const handleAddResume = () => {
        setAboutData({
            ...aboutData,
            resumes: [...aboutData.resumes, { label: "New Resume", url: "" }]
        });
    };

    const handleRemoveResume = (index) => {
        const updated = aboutData.resumes.filter((_, i) => i !== index);
        setAboutData({ ...aboutData, resumes: updated });
    };

    const updateResume = (index, field, value) => {
        const updated = [...aboutData.resumes];
        updated[index] = { ...updated[index], [field]: value };
        setAboutData({ ...aboutData, resumes: updated });
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
        console.log("Saving multiple resumes to Supabase...");
        try {
            // 1. Fetch current profile
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .maybeSingle();

            if (fetchError) {
                console.error("Fetch Error:", fetchError);
                throw fetchError;
            }

            // 2. Perform the Upsert
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: profile?.id,
                    name: profile?.name || portfolioData.hero.name,
                    role: profile?.role || portfolioData.hero.role,
                    description: profile?.description || portfolioData.hero.description,
                    image_url: profile?.image_url || portfolioData.hero.image,
                    resumes: aboutData.resumes,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setIsEditing(false);
            alert("All resumes saved successfully!");
        } catch (err) {
            console.error("Save Error:", err);
            let msg = "Failed to save: " + err.message;
            if (err.message?.includes("resumes") && err.message?.includes("not exist")) {
                msg = "DATABASE ERROR: You must run the SQL command to add the 'resumes' column in Supabase!";
            }
            alert(msg);
        }
    };

    const skills = [
        "JavaScript", "React.js", "Node.js", "HTML5", "CSS3",
        "Git", "GitHub", "UI/UX Design", "Responsive Design", "API Integration", "Supabase"
    ];

    return (
        <section className="section about">
            <div className="container">
                <div className="section-header-inline">
                    <h2 className="section-title">About <span>Me</span></h2>
                    <button
                        className="btn btn-outline"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "✕ Cancel" : "Manage Resumes"}
                    </button>
                </div>

                <div className="about-content">
                    <div className="about-text">
                        <h3>More than just code.</h3>
                        <p>
                            I'm a passionate Full Stack Developer based in India. I enjoy turning complex problems into simple, beautiful, and intuitive digital experiences.
                        </p>
                        <p>
                            With a focus on building scalable and high-performance applications, I specialize in the modern web ecosystem, transforming ideas into functional reality through clean code and user-centric design.
                        </p>

                        <div className="about-actions">
                            {isEditing ? (
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
                                        <button className="btn btn-outline btn-sm" onClick={handleAddResume}>+ Add Another Resume</button>
                                        <button className="btn btn-primary" onClick={handleSave}>Save All</button>
                                    </div>
                                </div>
                            ) : (
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
                            )}
                        </div>
                    </div>

                    <div className="about-skills">
                        <h3>My Tech Stack</h3>
                        <div className="skills-grid">
                            {skills.map((skill, index) => (
                                <div key={index} className="skill-item">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
