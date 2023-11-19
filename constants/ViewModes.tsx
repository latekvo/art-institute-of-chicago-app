enum ViewModes {
    explore = 0,
    categories, // different way of filtering via some AIC-API field, will use the first result as a preview
    favourites,
    search, // hidden from the mode selector, enabled by clicking on the search bar
    details, // shows specific art record along with all it's details
}

export default ViewModes;