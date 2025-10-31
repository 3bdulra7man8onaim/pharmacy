// ImgBB API للصور
window.IMGBB_API_KEY = 'efd9898834842fa6a911152397bbd357';

// رفع الصورة وتحويلها لـ link
window.uploadImage = async function(file) {
    if (!file.type.startsWith('image/')) {
        throw new Error('يرجى اختيار ملف صورة صحيح');
    }
    
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('حجم الصورة كبير جداً (الحد الأقصى 10 ميجا)');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', window.IMGBB_API_KEY);
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('فشل رفع الصورة');
    }
    
    const data = await response.json();
    
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error('فشل رفع الصورة');
    }
};