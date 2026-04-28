export const ItemData = async () => {
    const ItemShow = await fetch('http://localhost:8080//api/claimHistory', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return ItemShow.json();
}
const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_preset_name'); // เปลี่ยนเป็น Preset ของคุณ
    formData.append('cloud_name', 'your_cloud_name');     // เปลี่ยนเป็น Cloud Name ของคุณ

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        return data.secure_url; // ส่ง URL ที่ได้กลับไป
    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return null;
    }
};