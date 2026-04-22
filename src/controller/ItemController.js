export const ItemData = async () => {
    const ItemShow = await fetch('http://localhost:8080/api/items', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return ItemShow.json();
}