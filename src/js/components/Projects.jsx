import React, { useState, useEffect } from 'react';
import '../../css/Projects.css';
import { portfolioData } from '../../data/portfolioData';
import { supabase } from '../../supabaseClient';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        tags: "",
        link: "",
        image: null
    });

    // Fetch and Sync Projects with Supabase
    useEffect(() => {
        const syncProjects = async () => {
            console.log("Starting Supabase project sync...");
            try {
                // 1. Fetch current projects from Supabase
                const { data: dbProjects, error: fetchError } = await supabase
                    .from('projects')
                    .select('*');

                if (fetchError) throw fetchError;
                console.log("Current DB Projects:", dbProjects);

                // 2. Sync loop: Upsert every project from the JS file
                const syncPromises = portfolioData.projects.map(async (p) => {
                    const existing = dbProjects?.find(item => item.title === p.title);

                    const projectData = {
                        id: existing?.id || undefined,
                        title: p.title,
                        description: p.description,
                        tags: p.tags,
                        link: p.link,
                        image_url: p.image, // Note: This might be a relative path from Vite
                        created_at: existing?.created_at || new Date().toISOString()
                    };

                    const { error: upsertError } = await supabase
                        .from('projects')
                        .upsert(projectData);

                    if (upsertError) {
                        console.error(`Error syncing project "${p.title}":`, upsertError);
                        return null;
                    }
                    return p.title;
                });

                const results = await Promise.all(syncPromises);
                console.log("Sync complete for:", results.filter(Boolean));

                // 3. Final Fetch to update UI state
                const { data: finalData, error: finalError } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (finalError) throw finalError;

                if (finalData && finalData.length > 0) {
                    setProjects(finalData.map(p => ({
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        tags: p.tags || [],
                        link: p.link,
                        image: p.image_url
                    })));
                } else {
                    setProjects(portfolioData.projects);
                }

            } catch (err) {
                console.error("Projects Sync Error:", err);
                setProjects(portfolioData.projects);
            } finally {
                setLoading(false);
            }
        };

        syncProjects();
    }, []);

    const handleAddProject = async () => {
        if (!newProject.title || !newProject.description || !newProject.link || !newProject.image) {
            alert("Please fill in all required fields and upload an image!");
            return;
        }

        try {
            const tagsArray = typeof newProject.tags === 'string' && newProject.tags.trim() !== ""
                ? newProject.tags.split(',').map(tag => tag.trim())
                : [];

            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    title: newProject.title,
                    description: newProject.description,
                    tags: tagsArray,
                    link: newProject.link,
                    image_url: newProject.image
                }])
                .select();

            if (error) throw error;

            if (data) {
                const added = {
                    id: data[0].id,
                    title: data[0].title,
                    description: data[0].description,
                    tags: data[0].tags,
                    link: data[0].link,
                    image: data[0].image_url
                };
                setProjects([added, ...projects]);
                setNewProject({ title: "", description: "", tags: "", link: "", image: null });
                setIsEditing(false);
                alert("Project added to database!");
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to save project back to Supabase.");
        }
    };

    const handleDeleteProject = async (id, index) => {
        if (!id) {
            alert("This project is local and cannot be deleted from the database.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this project from the database?")) {
            try {
                const { error } = await supabase
                    .from('projects')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setProjects(projects.filter((_, i) => i !== index));
                alert("Project deleted!");
            } catch (err) {
                console.error("Delete Error:", err);
                alert("Failed to delete from database.");
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large! Max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProject({ ...newProject, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const normalizeLink = (url) => {
        if (!url) return "#";
        const trimmed = url.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
            return trimmed;
        }
        if (trimmed.startsWith('//')) {
            return `https:${trimmed}`;
        }
        return `https://${trimmed}`;
    };

    if (loading) return null;

    return (
        <section className="section projects">
            <div className="container">
                <div className="projects-header">
                    <h2 className="section-title">Featured <span>Projects</span></h2>
                    <button
                        className="btn btn-outline"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Close Editor" : "Manage Projects"}
                    </button>
                </div>

                {isEditing && (
                    <div className="project-editor-form">
                        <h3>Add New Project</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="e.g., AI Chat Dashboard"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                />
                                <span className="helper-text">Project Title <span className="req">*</span></span>
                            </div>

                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="e.g., React, Node.js"
                                    value={newProject.tags}
                                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                                />
                                <span className="helper-text">Technologies (Optional)</span>
                            </div>

                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={newProject.link}
                                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                />
                                <span className="helper-text">Project Link <span className="req">*</span></span>
                            </div>

                            <div className="input-group">
                                <label className={`file-input-label ${newProject.image ? 'selected' : ''}`}>
                                    <span>{newProject.image ? '✅ Image Uploaded' : '📸 Upload Thumbnail'}</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                </label>
                                <span className="helper-text">Project Thumbnail <span className="req">*</span></span>
                            </div>

                            <div className="input-group textarea-group">
                                <textarea
                                    placeholder="Describe your project..."
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                />
                                <span className="helper-text">Description <span className="req">*</span></span>
                            </div>
                        </div>
                        <div className="editor-actions">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddProject}
                                disabled={!newProject.title || !newProject.description || !newProject.link || !newProject.image}
                            >
                                Add Project to Portfolio
                            </button>
                        </div>
                    </div>
                )}

                <div className="projects-grid">
                    {projects.map((project, index) => (
                        <div key={index} className="project-card">
                            <div className="project-card-inner">
                                <div className="project-card-front">
                                    <div className="project-image">
                                        <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {isEditing && (
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(project.id, index);
                                                }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <div className="project-front-info">
                                        <h3>{project.title}</h3>
                                    </div>
                                </div>
                                <div className="project-card-back">
                                    <div className="project-info">
                                        <h3>{project.title}</h3>
                                        <div className="project-description-scroll">
                                            <p>{project.description}</p>
                                        </div>
                                        <div className="project-tags">
                                            {project.tags.map((tag, i) => (
                                                <span key={i}>{tag}</span>
                                            ))}
                                        </div>
                                        <div className="project-link-container">
                                            <a href={normalizeLink(project.link)} className="project-link" target="_blank" rel="noopener noreferrer">View Project</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
