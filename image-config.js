/*
 * إعدادات رفع الصور - ImgBB API
 * 
 * للحصول على API key:
 * 1. اذهب إلى https://imgbb.com/api
 * 2. أنشئ حساب مجاني
 * 3. احصل على API key
 * 4. ضعه أدناه
 */

// ImgBB API Configuration
window.IMGBB_API_KEY = 'efd9898834842fa6a911152397bbd357'; // Your API key

// Image upload function
window.uploadImageToImgBB = async function(file) {
    if (!window.IMGBB_API_KEY) {
        throw new Error('ImgBB API Key غير محدد');
    }
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        throw new Error('يرجى اختيار ملف صورة صحيح (JPG, PNG, GIF)');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('حجم الصورة كبير جداً (الحد الأقصى 10 ميجا)');
    }
    
    console.log('📤 Uploading image to ImgBB...', {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: file.type
    });
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', window.IMGBB_API_KEY);
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('ImgBB error response:', errorText);
        throw new Error(`فشل رفع الصورة: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Image uploaded successfully:', data.data.url);
        return {
            url: data.data.url,
            deleteUrl: data.data.delete_url,
            displayUrl: data.data.display_url,
            size: data.data.size
        };
    } else {
        throw new Error('فشل رفع الصورة: ' + (data.error?.message || 'خطأ غير معروف'));
    }
};

// Test API function
window.testImgBBConnection = async function() {
    try {
        // Test with a small base64 image
        const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const formData = new FormData();
        formData.append('image', testImageData);
        formData.append('key', window.IMGBB_API_KEY);
        
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ ImgBB API test successful');
            return { success: true, message: 'API يعمل بشكل صحيح' };
        } else {
            throw new Error(data.error?.message || 'فشل الاختبار');
        }
        
    } catch (error) {
        console.error('❌ ImgBB API test failed:', error);
        return { success: false, message: error.message };
    }
};