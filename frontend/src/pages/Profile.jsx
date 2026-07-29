import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  CreditCard, Calendar, Camera, Loader2, 
  FileText, Trash2, Download, Plus, X, Edit2, Check
} from 'lucide-react';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const userRole = localStorage.getItem('userRole') || 'Employee';
  const canEditAll = userRole === 'HR Manager' || userRole === 'Admin';

  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    email: '',
    employee_code: '',
    national_id: '',
    hire_date: ''
  });

  const [showDocForm, setShowDocForm] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    document_type: 'identity',
    file: null
  });

  const documentTypes = {
    contract: 'قرارداد',
    resume: 'رزومه',
    identity: 'مدرک هویتی',
    certificate: 'گواهینامه',
    other: 'سایر'
  };

  const token = localStorage.getItem('access_token') || localStorage.getItem('access');

  const fetchData = async () => {
    try {
      const profileRes = await fetch('http://localhost:8000/api/hr/employees/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfileData(pData);
      }

      const docsRes = await fetch('http://localhost:8000/api/hr/documents/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (docsRes.ok) {
        const dData = await docsRes.json();
        setDocuments(dData.results || dData); 
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await fetch('http://localhost:8000/api/hr/employees/me/', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        email: profileData?.email || '',
        employee_code: profileData?.employee_code || '',
        national_id: profileData?.national_id || '',
        hire_date: profileData?.hire_date || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/hr/employees/me/', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.file || !docForm.title) return;

    setDocUploading(true);
    const formData = new FormData();
    formData.append('title', docForm.title);
    formData.append('document_type', docForm.document_type);
    formData.append('file', docForm.file);

    try {
      const response = await fetch('http://localhost:8000/api/hr/documents/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setShowDocForm(false);
        setDocForm({ title: '', document_type: 'identity', file: null });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('آیا از حذف این مدرک اطمینان دارید؟')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/hr/documents/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-8 py-10 text-right">

      {/* هدر صفحه و کنترل‌های ویرایش */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white/90">پروفایل کاربری</h1>
          <p className="mt-2 text-sm text-white/40">مدیریت اطلاعات شخصی، سازمانی و مدارک شما</p>
        </div>

        {!isEditing ? (
          <button 
            onClick={handleEditToggle}
            className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            <Edit2 size={16} />
            ویرایش اطلاعات
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleEditToggle}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              انصراف
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition-transform hover:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              ذخیره تغییرات
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        <div className="col-span-1">
          <div className="sticky top-8 flex flex-col items-center rounded-3xl border border-white/[0.04] bg-white/[0.01] p-10 text-center backdrop-blur-sm">
            <div className="relative mb-8 group">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] shadow-xl transition-all duration-300 group-hover:border-white/20">
                {profileData?.profile_picture ? (
                  <img 
                    src={profileData.profile_picture} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-light text-white/30 uppercase">
                    {profileData?.first_name ? profileData.first_name.charAt(0) : <User size={48} strokeWidth={1} />}
                  </span>
                )}
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : (
                  <Camera className="h-8 w-8 text-white/90" />
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h2 className="text-2xl font-medium text-white/90">
              {profileData?.first_name} {profileData?.last_name}
            </h2>
            <p className="mt-2 text-sm font-light text-white/50">{profileData?.job_title || 'سمت شغلی ثبت نشده'}</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          
          <div className="rounded-3xl border border-white/[0.04] bg-white/[0.01] p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-base font-medium text-white/80">اطلاعات سازمانی</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <InfoField 
                label="کد پرسنلی" 
                value={isEditing && canEditAll ? editForm.employee_code : profileData?.employee_code} 
                icon={CreditCard} 
                isEditing={isEditing && canEditAll}
                onChange={(e) => setEditForm({...editForm, employee_code: e.target.value})}
              />
              <InfoField 
                label="کد ملی" 
                value={isEditing && canEditAll ? editForm.national_id : profileData?.national_id} 
                icon={User} 
                isEditing={isEditing && canEditAll}
                onChange={(e) => setEditForm({...editForm, national_id: e.target.value})}
              />
              <InfoField label="دپارتمان" value={profileData?.department_name} icon={Briefcase} />
              
              <InfoField 
                label="تاریخ استخدام" 
                value={isEditing && canEditAll ? editForm.hire_date : profileData?.hire_date} 
                icon={Calendar} 
                isEditing={isEditing && canEditAll}
                onChange={(e) => setEditForm({...editForm, hire_date: e.target.value})}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.04] bg-white/[0.01] p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-base font-medium text-white/80">اطلاعات تماس</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <InfoField 
                label="ایمیل سازمانی" 
                value={isEditing && canEditAll ? editForm.email : profileData?.email} 
                icon={Mail} 
                isEditing={isEditing && canEditAll}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
              <InfoField 
                label="شماره موبایل" 
                value={isEditing ? editForm.phone : profileData?.phone} 
                icon={Phone} 
                isEditing={isEditing}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
              <InfoField 
                label="آدرس سکونت" 
                value={isEditing ? editForm.address : profileData?.address} 
                icon={MapPin} 
                fullWidth 
                isEditing={isEditing}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.04] bg-white/[0.01] p-8 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-base font-medium text-white/80">مدارک و اسناد</h3>
              {!showDocForm && (
                <button 
                  onClick={() => setShowDocForm(true)}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
                >
                  <Plus size={16} />
                  افزودن مدرک
                </button>
              )}
            </div>

            {showDocForm && (
              <div className="mb-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/70">آپلود مدرک جدید</h4>
                  <button onClick={() => setShowDocForm(false)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleDocumentSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50">عنوان مدرک</label>
                    <input 
                      type="text"
                      required
                      value={docForm.title}
                      onChange={(e) => setDocForm({...docForm, title: e.target.value})}
                      className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none"
                      placeholder="مثال: اسکن کارت ملی"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50">نوع مدرک</label>
                    <select 
                      value={docForm.document_type}
                      onChange={(e) => setDocForm({...docForm, document_type: e.target.value})}
                      className="rounded-xl border border-white/[0.05] bg-[#121212] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none"
                    >
                      {Object.entries(documentTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs text-white/50">فایل ضمیمه</label>
                    <input 
                      type="file"
                      required
                      onChange={(e) => setDocForm({...docForm, file: e.target.files[0]})}
                      className="w-full text-sm text-white/50 file:mr-4 file:rounded-xl file:border-0 file:bg-white/[0.05] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white/70 hover:file:bg-white/[0.1]"
                    />
                  </div>
                  <div className="sm:col-span-2 mt-2 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={docUploading}
                      className="flex items-center gap-2 rounded-xl bg-white text-black px-6 py-2.5 text-sm font-medium transition-transform hover:scale-[0.98] disabled:opacity-50"
                    >
                      {docUploading ? <Loader2 size={16} className="animate-spin" /> : 'ذخیره مدرک'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* لیست مدارک */}
            <div className="space-y-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-white/[0.02] bg-white/[0.01] px-4 py-3 transition-colors hover:bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
                        <FileText size={18} className="text-white/40" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-medium text-white/90">{doc.title}</span>
                        <span className="text-xs text-white/40">{doc.document_type_display || documentTypes[doc.document_type]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.file && (
                        <a 
                          href={doc.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Download size={16} />
                        </a>
                      )}
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400/50 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-white/30">
                  <FileText size={32} className="mb-3 opacity-20" />
                  <span className="text-sm">هیچ مدرکی ثبت نشده است</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// کامپوننت فیلد حتماً باید خارج از Profile تعریف بشه
function InfoField({ label, value, icon: Icon, fullWidth, isEditing, onChange }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs font-medium text-white/40 pr-1">{label}</span>
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-300 ${isEditing ? 'bg-white/[0.05] border-white/10 ring-1 ring-white/10' : 'bg-white/[0.02] border-white/[0.02]'}`}>
        <Icon size={16} className={`${isEditing ? 'text-white/70' : 'text-white/30'} shrink-0 transition-colors`} />
        
        {isEditing ? (
          <input 
            type="text" 
            value={value || ''} 
            onChange={onChange}
            className="w-full bg-transparent text-sm font-light text-white outline-none placeholder:text-white/20"
            placeholder={`وارد کردن ${label}...`}
          />
        ) : (
          <span className="text-sm font-light text-white/80 w-full truncate">
            {value || <span className="text-white/20">ثبت نشده</span>}
          </span>
        )}
      </div>
    </div>
  );
}