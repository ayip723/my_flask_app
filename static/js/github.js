$(function() {
  $('#submit').click(function (e) {
    e.preventDefault();
    var organization = $('#organization').val()
    $.ajax({
      url: '/get_top_repos',
      method: 'GET',
      data: {organization: organization},
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          alert('Error: ' + data.error);
          return;
        }

        var $tbody = $('#reposTable tbody');
        $tbody.empty();
        data.forEach(function (item, index) {
          $tbody.append('<tr><td>' + item.name + '</td><td>' + item.stars + '</td><td>' + item.forks + '</td><td>' + item.contributors + '</td></tr>')
        });
        $('#reposTable').trigger('update').trigger('sorton', [[[1,1]]]);
      },
      error: function (error) {
        console.log(error);
      }
    });

    $.ajax({
      url: '/get_top_contributors',
      method: 'GET',
      data: {organization: organization},
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          return;
        }

        var $tbody = $('#internalTable tbody');
        $tbody.empty();
        $.each(data.internal, function (login, contributions) {
          $tbody.append('<tr><td>' + login + '</td><td>' + contributions + '</td></tr>')
        });
        $('#internalTable').trigger('update').trigger('sorton', [[[1,1]]]);

        var $tbody = $('#externalTable tbody');
        $tbody.empty();
        $.each(data.external, function (login, contributions) {
          $tbody.append('<tr><td>' + login + '</td><td>' + contributions + '</td></tr>')
        });
        $('#externalTable').trigger('update').trigger('sorton', [[[1,1]]]);
      },
      error: function (error) {
        console.log(error);
      }
    });
  });
  $('#reposTable').tablesorter({
    headers: {
      0: { sorter: false },
      1: { lockedOrder: 'desc' },
      2: { lockedOrder: 'desc' },
      3: { lockedOrder: 'desc' },
    }
  });
  $('#internalTable').tablesorter({
    headers: {
      0: { sorter: false },
      1: { sorter: false }
    }
  });
  $('#externalTable').tablesorter({
    headers: {
      0: { sorter: false },
      1: { sorter: false }
    }
  });
  $('#tabs').tabs();
});
