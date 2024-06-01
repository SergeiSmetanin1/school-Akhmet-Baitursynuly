function initMap() {
    const center = { lat: 49.74552392671465, lng: 71.091176122427 };
    const map = new google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 17,
        mapId: "DEMO_MAP_ID",
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    new google.maps.marker.AdvancedMarkerElement({
        position: center,
        map: map,
        title: "School location"
    });
}
window.initMap = initMap;
