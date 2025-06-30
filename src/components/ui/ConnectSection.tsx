'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Button } from '@aws-amplify/ui-react';
import { Linkedin, Github, Twitter, Mail, ExternalLink, Heart } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];

interface ConnectSectionProps {
    className?: string;
}

// Estilos personalizados
const connectStyles = `
    .connect-section {
        margin-bottom: 4rem;
    }

    .connect-container {
        background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(139, 92, 246, 0.05) 25%, 
            rgba(236, 72, 153, 0.05) 50%, 
            rgba(245, 101, 101, 0.05) 75%, 
            rgba(251, 191, 36, 0.1) 100%);
        border-radius: 24px;
        padding: 4rem;
        position: relative;
        overflow: hidden;
        margin-top: 2rem;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .connect-section.dark-mode .connect-container {
        background: linear-gradient(135deg, 
            rgba(30, 41, 59, 0.95) 0%, 
            rgba(51, 65, 85, 0.92) 25%, 
            rgba(71, 85, 105, 0.92) 50%, 
            rgba(100, 116, 139, 0.92) 75%, 
            rgba(148, 163, 184, 0.95) 100%);
        border: 1px solid rgba(148, 163, 184, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .connect-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
                                radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 60%);
        pointer-events: none;
        z-index: 0;
    }

    .connect-content {
        position: relative;
        z-index: 1;
        max-width: 800px;
        margin: 0 auto;
    }

    .connect-subtitle {
        color: var(--amplify-colors-font-secondary);
        font-size: 1.25rem;
        margin-bottom: 3rem;
        font-weight: 400;
    }

    .connect-section.dark-mode .connect-subtitle {
        color: #e0e7ef;
    }

    .connect-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    .connect-button {
        background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        color: var(--amplify-colors-font-primary);
        text-decoration: none;
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        min-height: 140px;
        justify-content: center;
    }

    .connect-section.dark-mode .connect-button {
        background: linear-gradient(135deg, 
            rgba(30, 41, 59, 0.95) 0%, 
            rgba(51, 65, 85, 0.92) 100%);
        color: #f1f5fa;
        border: 2px solid rgba(148, 163, 184, 0.25);
    }

    .connect-button:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .connect-section.dark-mode .connect-button:hover {
        border-color: #a78bfa;
        background: linear-gradient(135deg, 
            rgba(71, 85, 105, 0.98) 0%, 
            rgba(100, 116, 139, 0.98) 100%);
    }

    .connect-button-linkedin {
        border-color: rgba(10, 102, 194, 0.3);
    }

    .connect-section.dark-mode .connect-button-linkedin {
        border-color: #0A66C2;
    }

    .connect-button-linkedin:hover {
        background: linear-gradient(135deg, 
            rgba(10, 102, 194, 0.15) 0%, 
            rgba(10, 102, 194, 0.05) 100%);
        border-color: rgba(10, 102, 194, 0.5);
    }

    .connect-section.dark-mode .connect-button-linkedin:hover {
        background: linear-gradient(135deg, 
            rgba(10, 102, 194, 0.25) 0%, 
            rgba(10, 102, 194, 0.10) 100%);
        border-color: #0A66C2;
    }

    .connect-button-github {
        border-color: rgba(51, 51, 51, 0.3);
    }

    .connect-section.dark-mode .connect-button-github {
        border-color: #f1f5fa;
    }

    .connect-button-github:hover {
        background: linear-gradient(135deg, 
            rgba(51, 51, 51, 0.15) 0%, 
            rgba(51, 51, 51, 0.05) 100%);
        border-color: rgba(51, 51, 51, 0.5);
    }

    .connect-section.dark-mode .connect-button-github:hover {
        background: linear-gradient(135deg, 
            rgba(51, 51, 51, 0.25) 0%, 
            rgba(51, 51, 51, 0.10) 100%);
        border-color: #f1f5fa;
    }

    .connect-button-twitter {
        border-color: rgba(29, 161, 242, 0.3);
    }

    .connect-section.dark-mode .connect-button-twitter {
        border-color: #1DA1F2;
    }

    .connect-button-twitter:hover {
        background: linear-gradient(135deg, 
            rgba(29, 161, 242, 0.15) 0%, 
            rgba(29, 161, 242, 0.05) 100%);
        border-color: rgba(29, 161, 242, 0.5);
    }

    .connect-section.dark-mode .connect-button-twitter:hover {
        background: linear-gradient(135deg, 
            rgba(29, 161, 242, 0.25) 0%, 
            rgba(29, 161, 242, 0.10) 100%);
        border-color: #1DA1F2;
    }

    .connect-button-email {
        border-color: rgba(234, 88, 12, 0.3);
    }

    .connect-section.dark-mode .connect-button-email {
        border-color: #EA580C;
    }

    .connect-button-email:hover {
        background: linear-gradient(135deg, 
            rgba(234, 88, 12, 0.15) 0%, 
            rgba(234, 88, 12, 0.05) 100%);
        border-color: rgba(234, 88, 12, 0.5);
    }

    .connect-section.dark-mode .connect-button-email:hover {
        background: linear-gradient(135deg, 
            rgba(234, 88, 12, 0.25) 0%, 
            rgba(234, 88, 12, 0.10) 100%);
        border-color: #EA580C;
    }

    .connect-button-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.2) 0%, 
            rgba(255, 255, 255, 0.1) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .connect-section.dark-mode .connect-button-icon {
        background: linear-gradient(135deg, 
            rgba(71, 85, 105, 0.7) 0%, 
            rgba(100, 116, 139, 0.7) 100%);
    }

    .connect-button:hover .connect-button-icon {
        transform: scale(1.1);
    }

    .connect-button-text {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: inherit;
    }

    .connect-section.dark-mode .connect-button-text {
        color: #f1f5fa;
    }

    .connect-button-description {
        font-size: 0.875rem;
        color: var(--amplify-colors-font-tertiary);
        margin: 0;
        text-align: center;
    }

    .connect-section.dark-mode .connect-button-description {
        color: #cbd5e1;
    }

    .connect-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .connect-section.dark-mode .connect-footer {
        border-top: 1px solid rgba(148, 163, 184, 0.3);
    }

    .connect-footer-text {
        color: var(--amplify-colors-font-tertiary);
        font-size: 0.9rem;
    }

    .connect-section.dark-mode .connect-footer-text {
        color: #cbd5e1;
    }

    .section-title {
        background: linear-gradient(135deg, 
            var(--amplify-colors-primary-80) 0%, 
            var(--amplify-colors-secondary-80) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 800;
        text-align: center;
        margin-bottom: 1rem;
    }

    .connect-section.dark-mode .section-title {
        background: linear-gradient(135deg, 
            #60A5FA 0%, 
            #A78BFA 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    @media (max-width: 768px) {
        .connect-container {
            padding: 2.5rem 2rem;
        }
        
        .connect-buttons {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .connect-button {
            padding: 1.25rem;
            min-height: 120px;
        }
        
        .connect-button-icon {
            width: 35px;
            height: 35px;
        }
        
        .connect-subtitle {
            font-size: 1.125rem;
            margin-bottom: 2rem;
        }
    }
`;

// Enlaces predeterminados
const defaultLinks = {
    linkedin: "https://linkedin.com/in/fortino-romero-mantilla",
    github: "https://github.com/fortino-romero",
    twitter: "https://twitter.com/fortino_romero",
    email: "fortino.rom@gmail.com"
};

const ConnectSection: React.FC<ConnectSectionProps> = ({ className = '' }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [mounted, setMounted] = useState(false);

    const { mode } = useTheme();
    const { t } = useTranslation('homepage');
    const { isAuthenticated } = useAuth();

    // Client initialization
    const client = generateClient<Schema>();

    // Effect para marcar como montado
    useEffect(() => {
        setMounted(true);
    }, []);

    // Función para obtener datos del perfil
    const fetchProfile = async () => {
        try {
            const authMode = isAuthenticated ? 'userPool' : 'identityPool';
            const { data: profiles } = await client.models.Profile.list({
                authMode,
                filter: {
                    isActive: {
                        eq: true
                    }
                }
            });

            if (profiles && profiles.length > 0) {
                setProfile(profiles[0]);
            }
        } catch (err) {
            console.error('Error fetching profile for connect:', err);
            // No mostrar error, usar datos predeterminados
        }
    };

    // Effect para cargar datos
    useEffect(() => {
        if (!mounted) return;
        fetchProfile();
    }, [mounted, isAuthenticated]);

    if (!mounted) {
        return null;
    }

    // Usar enlaces del perfil o predeterminados
    const links = {
        linkedin: profile?.linkedinUrl || defaultLinks.linkedin,
        github: profile?.githubUrl || defaultLinks.github,
        twitter: profile?.twitterUrl || defaultLinks.twitter,
        email: profile?.emailContact || defaultLinks.email
    };

    const handleEmailClick = () => {
        window.location.href = `mailto:${links.email}`;
    };

    const handleLinkClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <View className={`connect-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
            <style>{connectStyles}</style>
            
            {/* Header */}
            <Heading
                level={2}
                fontSize={{ base: '2rem', medium: '2.5rem' }}
                className="section-title"
            >
                {t('about.connect.title')}
            </Heading>

            {/* Connect Container */}
            <View className="connect-container">
                <View className="connect-content">
                    {/* Subtitle */}
                    <Text className="connect-subtitle">
                        {t('about.connect.subtitle')}
                    </Text>

                    {/* Social Buttons */}
                    <View className="connect-buttons">
                        {/* LinkedIn */}
                        <button
                            className="connect-button connect-button-linkedin"
                            onClick={() => handleLinkClick(links.linkedin)}
                        >
                            <View className="connect-button-icon">
                                <Linkedin size={20} color="#0A66C2" />
                            </View>
                            <Text className="connect-button-text">
                                {t('about.connect.actions.linkedin')}
                            </Text>
                            <Text className="connect-button-description">
                                Professional networking
                            </Text>
                        </button>

                        {/* GitHub */}
                        <button
                            className="connect-button connect-button-github"
                            onClick={() => handleLinkClick(links.github)}
                        >
                            <View className="connect-button-icon">
                                <Github size={20} color="#333" />
                            </View>
                            <Text className="connect-button-text">
                                {t('about.connect.actions.github')}
                            </Text>
                            <Text className="connect-button-description">
                                Code repositories
                            </Text>
                        </button>

                        {/* Twitter */}
                        <button
                            className="connect-button connect-button-twitter"
                            onClick={() => handleLinkClick(links.twitter)}
                        >
                            <View className="connect-button-icon">
                                <Twitter size={20} color="#1DA1F2" />
                            </View>
                            <Text className="connect-button-text">
                                {t('about.connect.actions.twitter')}
                            </Text>
                            <Text className="connect-button-description">
                                Tech thoughts & updates
                            </Text>
                        </button>

                        {/* Email */}
                        <button
                            className="connect-button connect-button-email"
                            onClick={handleEmailClick}
                        >
                            <View className="connect-button-icon">
                                <Mail size={20} color="#EA580C" />
                            </View>
                            <Text className="connect-button-text">
                                {t('about.connect.actions.email')}
                            </Text>
                            <Text className="connect-button-description">
                                Direct collaboration
                            </Text>
                        </button>
                    </View>

                    {/* Footer */}
                    <View className="connect-footer">
                        <Heart size={16} color="rgba(236, 72, 153, 0.7)" />
                        <Text className="connect-footer-text">
                            Let's build something amazing together
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ConnectSection;
