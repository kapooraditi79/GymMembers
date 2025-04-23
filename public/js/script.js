$(document).ready(function () {
  // For add_payment.ejs and add_health.ejs
  $("#membership_id").change(function () {
    const membershipId = $(this).val();
    const isPaymentPage = window.location.pathname.includes("/payments/add");
    const isHealthPage = window.location.pathname.includes("/health/new");

    if (membershipId && (isPaymentPage || isHealthPage)) {
      const url = isPaymentPage
        ? `/payments/member/${membershipId}`
        : `/health/member/${membershipId}`;
      $.ajax({
        url: url,
        method: "GET",
        success: function (data) {
          if (isPaymentPage) {
            $("#name").val(data.name);
            $("#current_plan").val(data.plan);
          } else if (isHealthPage) {
            $("#user_name").val(data.name);
            $("#dob").val(data.dob);
            $("#gender").val(data.gender);
            $("#joining_date").val(data.joining_date);
          }
        },
        error: function () {
          if (isPaymentPage) {
            $("#name").val("");
            $("#current_plan").val("");
          } else if (isHealthPage) {
            $("#user_name").val("");
            $("#dob").val("");
            $("#gender").val("");
            $("#joining_date").val("");
          }
          alert("Error fetching member details");
        },
      });
    } else {
      if (isPaymentPage) {
        $("#name").val("");
        $("#current_plan").val("");
      } else if (isHealthPage) {
        $("#user_name").val("");
        $("#dob").val("");
        $("#gender").val("");
        $("#joining_date").val("");
      }
    }
  });

  // Hamburger menu toggle
  $("#hamburger").click(function () {
    $("#navbarMenu").toggleClass("active");
  });
});
