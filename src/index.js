async function getWishes() {
    // Disable button
    $('#extract-button').prop('disabled', true);
    $('#error').text('');

    // Reset data
    let table = $('#data');
    table.empty();
    table.append(
        '<tr><th>Item Type</th><th>Quality</th><th>Item Name</th><th>Time Recieved</th></tr>'
    );
    $('#progress').text('Processed pages: ');

    const type = $('#type-select').val();
    const typeText = $(`#type-select option[value="${type}"]`).text();
    const data = await window.api.getWishes(type);
    if (!data) {
        $('#data-title').text('ERROR LOADING WISHES');
        $('#error').text(
            'Make sure you open the wish history menu from in-game before running this script!'
        );
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
        $('#data-title').text(`${typeText} Wish History`);
        $('#export-button').prop('disabled', false);
        $('#extract-button').prop('disabled', false);
    }
}

async function exportData() {
    const res = await window.api.exportData();
    if (res) alert('Successfully exported data!');
}

window.api.listen('wishProgress', (event, message) => {
    console.log(message);
    $('#progress').append(`${message}... `);
});
