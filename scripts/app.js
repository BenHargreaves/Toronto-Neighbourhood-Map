/* ----Model---- */
var model = {
    locations : [
        { title: 'The Drake Hotel', location: { lat: 43.6432, lng: -79.4246 } },
        { title: 'BMO Field', location: { lat: 43.6332, lng: -79.4186 } },
        { title: 'Craigs Cookies', location: { lat: 43.6393, lng: -79.4428 } },
        { title: 'CN Tower', location: { lat: 43.6426, lng: -79.3871 } },
        { title: "Ripley's Aquarium", location: { lat: 43.6424, lng: -79.3860 } },
        { title: 'St. Lawrence Market', location: { lat: 43.6486, lng: -79.3715 } },
        { title: 'Casa Loma', location: { lat: 43.6780, lng: -79.4094 } },
        { title: 'Cabana Poolbar', location: { lat: 43.6400, lng: -79.3543 } },
        { title: 'Uniun Nightclub', location: { lat: 43.6457, lng: -79.4000 } },
        { title: 'Steamwhistle brewery', location: { lat: 43.6409, lng: -79.3853 } },
        { title: 'Amsterdam Brewhouse', location: { lat: 43.6379, lng: -79.3847 } },
        { title: 'Rogers Centre', location: { lat: 43.6414, lng: -79.3894 } },
        { title: 'Air Canada Centre', location: { lat: 43.6435, lng: -79.3791 } },
        { title: 'Royal Ontario Museum', location: { lat: 43.6677, lng: -79.3948 } },
        { title: 'University of Toronto', location: { lat: 43.6629, lng: -79.3957 } },
        { title: 'Toronto Islands', location: { lat: 43.6289, lng: -79.3944 } }
    ]
};


/* ----View Model---- */
var viewModels = {    
    mapInit: function () {
        // This is the primary bound ViewModel for the map and sidebar functions
        mapViewModel = function () {
            var self = this;
            // markers is the constant list of all markers, and is not visible in the view
            // filteredMarkers is forthe searchng functionality,
            // and it visible in the view.
            self.markers = ko.observableArray();
            self.filteredMarkers = ko.observableArray();
            self.filterString = ko.observable();
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 43.6463, lng: -79.3989 },
                zoom: 13
            });

            this.initMarkers = function(){
                for (var i = 0; i < model.locations.length; i++) {
                    var marker = new google.maps.Marker({
                        position: model.locations[i].location,
                        map: map,
                        title: model.locations[i].title
                    });
                    self.markers.push(marker);
                };
                // initialie the 'filtered array' which is displayed in view
                self.filteredMarkers(self.markers.slice(0));
            }

            this.filterSearch = function(){
                self.filteredMarkers.removeAll();
                for( var i = 0; i < self.markers().length; i++){
                    if (self.markers()[i].title.match(self.filterString())){
                        self.filteredMarkers.push(self.markers()[i])
                    } 
                }
            }

            this.resetSearch = function() {
                self.filteredMarkers(self.markers.slice(0));
            }

            //Initialize Markers automatically from Maps API callback - which only calls mapInit
            this.initMarkers();
        }
        ko.applyBindings( new mapViewModel());
    },
    // For hiding / showing hamburger menu. does not need binding
    toggleNav: function(){
        var sidebar = document.getElementById("collapsing-sidebar");
        if (sidebar.style.width == '0px') {
            sidebar.style.width = "250px";
        } else {
            sidebar.style.width = "0px";
        }
    }
}