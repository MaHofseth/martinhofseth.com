// Google Analytics 4 in cookieless mode: consent for storage is denied by
// default, so no cookies or local storage are set and no banner is needed.
(function () {
  var id = "G-QG6H36GD0C";
  if (!/(^|\.)martinhofseth\.com$/.test(location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  gtag("set", "ads_data_redaction", true);
  gtag("js", new Date());
  gtag("config", id, { allow_google_signals: false });

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
})();
