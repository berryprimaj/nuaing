import React, { useState, useEffect } from 'react';
import { Palette, MessageCircle, Save, UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import Layout from './Layout';
import { useSettings } from '../../contexts/SettingsContext';
import { AllSettings } from '../../contexts/SettingsContext';

interface ImageUploadProps {
    label: string;
    currentImageUrl: string | null;
    onFileChange: (file: File) => void;
    onRemove: () => void;
}


const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentImageUrl, onFileChange, onRemove }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onFileChange(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onRemove();
    };

    const displayUrl = preview || currentImageUrl;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex items-center space-x-4 p-2 border-2 border-dashed rounded-md">
                <div className="w-24 h-16 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                    {displayUrl ? (
                        <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                </div>
                <div className="flex-grow">
                    <input type="file" id={label} className="hidden" onChange={handleFileChange} accept="image/*" />
                    <label htmlFor={label} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <UploadCloud className="w-4 h-4 inline-block mr-2" />
                        Change
                    </label>
                    {displayUrl && (
                        <button onClick={handleRemove} type="button" className="ml-2 text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const Settings = () => {
  const { settings, isLoading, saveSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<Partial<AllSettings> | { [key: string]: any }>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (key: keyof AllSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key: keyof AllSettings, file: File) => {
    setLocalSettings(prev => ({ ...prev, [key]: file }));
  };

  const handleRemoveImage = (key: keyof AllSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: "" }));
  };
  
  const handleSave = () => {
      const formData = new FormData();
      
      Object.keys(localSettings).forEach(key => {
          const k = key as keyof AllSettings;
          if (localSettings[k] !== settings[k]) {
             const value = localSettings[k];
             if (value instanceof File || typeof value === 'string') {
                formData.append(k, value);
             }
          }
      });
      saveSettings(formData);
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
            <p className="mt-1 text-gray-600">Configure your hotspot system and appearance.</p>
          </div>
          <button onClick={handleSave} disabled={isLoading} className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200">
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center"><Palette className="inline mr-3 text-gray-500" />Hotspot Login Appearance</h3>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="hotspot_site_name" className="block text-sm font-medium text-gray-700">Site Name</label>
                        <input id="hotspot_site_name" type="text" value={localSettings.hotspot_site_name || ''} onChange={e => handleInputChange('hotspot_site_name', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="hotspot_welcome_message" className="block text-sm font-medium text-gray-700">Welcome Message</label>
                        <textarea id="hotspot_welcome_message" value={localSettings.hotspot_welcome_message || ''} onChange={e => handleInputChange('hotspot_welcome_message', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" rows={3}></textarea>
                    </div>
                </div>
                <div className="space-y-6">
                    <ImageUpload 
                        label="Logo"
                        currentImageUrl={settings.hotspot_logo}
                        onFileChange={(file) => handleFileChange('hotspot_logo', file)}
                        onRemove={() => handleRemoveImage('hotspot_logo')}
                    />
                    <ImageUpload
                        label="Background Image"
                        currentImageUrl={settings.hotspot_bg_image}
                        onFileChange={(file) => handleFileChange('hotspot_bg_image', file)}
                        onRemove={() => handleRemoveImage('hotspot_bg_image')}
                    />
                </div>
            </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center"><MessageCircle className="inline mr-3 text-gray-500" />API Integrations</h3>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="fonte_api_key" className="block text-sm font-medium text-gray-700">Fonte API Key</label>
                        <input id="fonte_api_key" type="password" value={localSettings.fonte_api_key || ''} onChange={e => handleInputChange('fonte_api_key', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Enter Fonte API Key"/>
                    </div>
                     <div>
                        <label htmlFor="google_client_id" className="block text-sm font-medium text-gray-700">Google Client ID</label>
                        <input id="google_client_id" type="text" value={localSettings.google_client_id || ''} onChange={e => handleInputChange('google_client_id', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Enter Google Client ID"/>
                    </div>
                </div>
                <div className="space-y-6">
                   <div>
                        <label htmlFor="fonte_device_id" className="block text-sm font-medium text-gray-700">Fonte Device ID (Sender)</label>
                        <input id="fonte_device_id" type="text" value={localSettings.fonte_device_id || ''} onChange={e => handleInputChange('fonte_device_id', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Enter Fonte Device ID"/>
                    </div>
                     <div>
                        <label htmlFor="google_client_secret" className="block text-sm font-medium text-gray-700">Google Client Secret</label>
                        <input id="google_client_secret" type="password" value={localSettings.google_client_secret || ''} onChange={e => handleInputChange('google_client_secret', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Enter Google Client Secret"/>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;