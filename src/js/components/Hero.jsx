import React, { useState, useEffect } from 'react';
import '../../css/Hero.css';
import { portfolioData } from '../../data/portfolioData';
import { supabase } from '../../supabaseClient';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const Hero = () => {
    const [hero, setHero] = useState(portfolioData.hero);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Fetch and Sync Hero Data with Supabase
    useEffect(() => {
        const syncHero = async () => {
            try {
                // 1. Fetch current data from Supabase
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                // 2. Logic: If no data exists, or if we want to ensure JS file takes precedence
                // For this portfolio, we'll auto-upsert the JS data to keep DB in sync with code edits
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data?.id || undefined,
                        name: portfolioData.hero.name,
                        role: portfolioData.hero.role,
                        description: portfolioData.hero.description,
                        image_url: portfolioData.hero.image,
                        resume_url: portfolioData.hero.resumeUrl,
                        updated_at: new Date()
                    });

                if (upsertError) throw upsertError;

                // 3. Update local state with the latest
                setHero({
                    name: portfolioData.hero.name,
                    role: portfolioData.hero.role,
                    description: portfolioData.hero.description,
                    image: portfolioData.hero.image,
                    resumeUrl: portfolioData.hero.resumeUrl
                });

            } catch (err) {
                console.error("Supabase Sync Error:", err);
                // Fallback to JS data if DB fails
                setHero(portfolioData.hero);
            } finally {
                setLoading(false);
            }
        };

        syncHero();
    }, []);

    const handleSave = async () => {
        try {
            // Updated to Supabase Upsert (Update or Insert)
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: (await supabase.from('profiles').select('id').single()).data?.id || undefined,
                    name: hero.name,
                    role: hero.role,
                    description: hero.description,
                    image_url: hero.image,
                    updated_at: new Date()
                });

            if (error) throw error;

            setIsEditing(false);
            alert("Profile updated in database!");
        } catch (error) {
            console.error("Supabase Save Error:", error);
            alert("Failed to save to database. Check your Supabase connection.");
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let imageDataUrl = null;

        if (file.name.toLowerCase().endsWith('.heic')) {
            try {
                alert("Converting HEIC...");
                if (!window.heic2any) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                const result = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
                const blob = Array.isArray(result) ? result[0] : result;
                imageDataUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                alert("HEIC conversion failed.");
                return;
            }
        } else {
            if (file.size > 5 * 1024 * 1024) {
                alert("File is too large! Please use images under 5MB.");
                return;
            }
            imageDataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        if (imageDataUrl) {
            setTempImage(imageDataUrl);
            setShowCropper(true);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async () => {
        try {
            const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
            setHero({ ...hero, image: croppedImage });
            setShowCropper(false);
            setTempImage(null);
        } catch (e) {
            console.error(e);
            alert("Cropping failed.");
        }
    };

    if (loading) return <div className="loading">Initializing Portfolio...</div>;

    return (
        <section className="hero">
            <div className="container hero-container">
                <div className="hero-content">
                    <h3 className="hero-subtitle">Hello, I'm</h3>

                    {isEditing ? (
                        <div className="edit-form">
                            <input
                                className="edit-input name-input"
                                value={hero.name}
                                onChange={(e) => setHero({ ...hero, name: e.target.value })}
                                placeholder="Edit Name"
                            />
                            <input
                                className="edit-input role-input"
                                value={hero.role}
                                onChange={(e) => setHero({ ...hero, role: e.target.value })}
                                placeholder="Edit Role"
                            />
                            <textarea
                                className="edit-input desc-input"
                                value={hero.description}
                                onChange={(e) => setHero({ ...hero, description: e.target.value })}
                                placeholder="Edit Description"
                            />
                            <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                        </div>
                    ) : (
                        <>
                            <h1 className="hero-title">
                                <span className="name">{hero.name}</span>
                                <span className="role">{hero.role}</span>
                            </h1>
                            <p className="hero-description">{hero.description}</p>
                            <div className="hero-btns">
                                <a href="#projects" className="btn btn-primary">View Work</a>
                                <button onClick={() => setIsEditing(true)} className="btn btn-outline">Edit Profile</button>
                            </div>
                        </>
                    )}
                </div>

                <div className="hero-visual">
                    <div className={`image-wrapper ${isEditing ? 'editing' : ''}`}>
                        <img src={hero.image} alt={hero.name} className="profile-image" />
                        <div className="glow-circle"></div>

                        {isEditing && (
                            <label className="image-upload-label">
                                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                <div className="upload-overlay">
                                    <span>📸 Change Photo</span>
                                </div>
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && (
                <div className="cropper-modal">
                    <div className="cropper-container">
                        <div className="cropper-header">
                            <h3>Adjust Profile Picture</h3>
                            <button className="close-btn" onClick={() => setShowCropper(false)}>&times;</button>
                        </div>
                        <div className="cropper-wrapper">
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>
                        <div className="cropper-footer">
                            <div className="zoom-control">
                                <span>Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(e.target.value)}
                                />
                            </div>
                            <div className="cropper-actions">
                                <button className="btn btn-outline" onClick={() => setShowCropper(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleCropConfirm}>Crop & Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Hero;
