enum ViewModes {
    explore = 0,
    categories, // different way of filtering via some AIC-API field, will use the first result as a preview
    favourites,
    settings, // currently unused, might display basic account info but i doubt i will find enough time for this before Nov 19th
    search, // hidden from the mode selector, enabled by clicking on the search bar
    aicWebView, // hidden from the mode selector, enabled by clicking on the aic logo
}

export default ViewModes;