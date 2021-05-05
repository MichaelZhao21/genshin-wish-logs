async function getWishes() {
    // Reset data
    let table = $('#data');
    table.empty();
    table.append('<tr><th>Item Type</th><th>Quality</th><th>Item Name</th><th>Time Recieved</th></tr>');
    $('#progress').text('Processed pages: ');

    const type = $('#type-select').val();
    const typeText = $(`#type-select option[value="${type}"]`).text();
    const data = await window.api.getWishes(type);
    if (!data) {
        $('#data-title').text('ERROR LOADING WISHES :((');
    } else {
        $('#data').append(
            data.map((d) => {
                let row = $('<tr></tr>');
                row.append($(`<td>${d.item_type}</td>`));
                row.append($(`<td>${d.rank_type}</td>`));
                row.append($(`<td>${d.name}</td>`));
                row.append($(`<td>${d.time}</td>`));
                return row;
            })
        );
        $('#data-title').text(`${typeText} Wish History`)
    }
}

window.api.listen('wishProgress', (event, message) => {
    console.log(message);
    $('#progress').append(`${message}... `);
});
