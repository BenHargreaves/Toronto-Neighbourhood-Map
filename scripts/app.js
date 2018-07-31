/* ----Model---- */
var model = {
    locations: [
        { title: 'The Drake Hotel', location: { lat: 43.6432, lng: -79.4246 } },
        { title: 'BMO Field', location: { lat: 43.6332, lng: -79.4186 } },
        { title: 'CN Tower', location: { lat: 43.6426, lng: -79.3871 } },
        { title: "Ripley's Aquarium", location: { lat: 43.6424, lng: -79.3860 } },
        { title: 'St. Lawrence Market', location: { lat: 43.6486, lng: -79.3715 } },
        { title: 'Casa Loma', location: { lat: 43.6780, lng: -79.4094 } },
        { title: 'Rebel Nightclub', location: { lat: 43.6400, lng: -79.3543 } },
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
            self.markers = ko.observableArray();
            self.filterString = ko.observable('');
            
            //define GMap object and centre on toronto city hall
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 43.6463, lng: -79.3989 },
                zoom: 13
            });

            this.initMarkers = function () {
                for (var i = 0; i < model.locations.length; i++) {
                    var marker = new google.maps.Marker({
                        position: model.locations[i].location,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: model.locations[i].title
                    });
                
                //this line is used for sidebar visibility. removing or adding the marker from the map
                // or setting visiblity was only removing the marker from the map itself
                marker.listVisibility = ko.observable(true);
                
                //define single infowindow.
                //this nfowindow gets reassigned to Markers dynamically, and has its content changed
                // if every marker hada its own infowindow, they wouldnt 
                // close automatically when another opens
                infoWindow = new google.maps.InfoWindow({
                    content: 'Loading...',
                    maxWidth: 350
                });

                google.maps.event.addListener(marker, 'click', function () {
                    infoWindow.setContent(this.infoText);
                    infoWindow.open(map, this);
                });

                google.maps.event.addListener(marker, 'click', toggleBounce);
          
                function toggleBounce() {
                    if (this.getAnimation() !== null) {
                        this.setAnimation(null);
                    } else {
                        var self = this;
                        self.setAnimation(google.maps.Animation.BOUNCE);
                        // stop the bouncing after 2 seconds. otherwise it goes forever.
                        setTimeout(function(){
                            self.setAnimation(null);
                    }, 2000);

                    }
                }
                // async call to Flickr and Geocoding APIs
                viewModels.pullPics(marker);
                self.markers.push(marker);
                };
            }

            // Takes sidebar search text (as a KO observable) and hides / shows markers
            // from the map and Sidebar accordingly
            this.filterSearch = function () {
                for (var i = 0; i < self.markers().length; i++) {
                    if (self.markers()[i].title.toUpperCase().match(self.filterString().toUpperCase())) {
                        //This line was added to overcome a 'blank search' 
                        //not repopulating lost markers from a previous search
                        self.markers()[i].setMap(map);
                        self.markers()[i].listVisibility(true)
                    } else {
                        self.markers()[i].setMap(null);
                        self.markers()[i].listVisibility(false)
                    }
                }
            }

            // show all markers - map and list. resets filter string KO.observable
            this.resetSearch = function () {
                self.filterString('');
                //Reset marker visibility on Map.
                // realistically the below could be replaced by a call to filterSearch() 
                // after the filterString is set to blank... I think.
                for (var i = 0; i < self.markers().length; i++) {
                    self.markers()[i].setMap(map);
                    self.markers()[i].listVisibility(true);
                }
            }

            //Initialize Markers automatically from Maps API callback - which only calls mapInit
            this.initMarkers();
        }
        ko.applyBindings(new mapViewModel());
    },

    maploadError: function(){
        alert('Google Maps API failed to load. Please check Console for full error');
    },
    // For hiding / showing hamburger menu. does not need binding
    toggleNav: function () {
        var sidebar = document.getElementById("collapsing-sidebar");
        if (sidebar.style.width == '0px') {
            sidebar.style.width = "250px";
        } else {
            sidebar.style.width = "0px";
        }
    },
    pullPics: function (data) {
        // If pics already retreived from Flickr, dont call API again.
        // this function is called asynchronously when every marker is loaded for the first time
        // this is why there is no 'trigger' call on the 'else' statement 
        // (else is called only on first call to this function, assuming they succeed)
        if (data.pics && data.infoText) {
            google.maps.event.trigger(data, 'click');
        } else {
            data.infoText = '<div class="container-fluid"><h2>' + data.title + '</h2>';
            data.pics = [];

            var urlGeocode = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ data.position.lat() +',' + data.position.lng() + '&key=AIzaSyBuvd9Jw5sMWtHH13t-dP2TbdqZGaT8a3M'
            // Call to Google maps Geocode API - LatLng to Address
            $.ajax({url: urlGeocode})
                .done(function(result){
                    data.infoText += '<p>' + result.results[0].formatted_address +'</p>'
                })
                .fail(function(){
                    data.infoText = '<p>Call to Google Geocoding API failed.<br />Please check network settings.</p>'
                });

            // replace spaces with '+' for URL formatting
            var searchParam = data.title.replace(/ /g, '+');
            searchParam = searchParam + '+Toronto';

            var urlFlickr = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e2fc11428743df60333c153c2cdd4245&text="' + searchParam + '"&sort=relevance&safe_search=1&per_page=5&extras=url_m'
            // Call to Flickr Photo Search Api - Pulls pics of location. The results are a bit of a mixed bag...
            $.ajax({url: urlFlickr})
                .done(function(result){
                    var x = result.getElementsByTagName("photo");
                    data.infoText += '<div class="d-flex flex-row" style="overflow-x: auto;">'
                    
                    // Extracts small image URL's from successful response
                    for (var i = 0; i < x.length; i++) {
                        data.pics.push(x[i].attributes.url_m.value);
                    }
                    // adds the URL's to image elements for display in the infoWindow of that marker
                    for (var i=0; i < data.pics.length; i++){
                        data.infoText += '<img class="p-1" style="height: 100px;" src="' + data.pics[i] + '" alt="Image">';
                    }
                })
                .fail(function(){
                    data.infoText += '<p>Call to Flickr API failed. Please check network settings.</p>'
                })
                .always(function(){
                    data.infoText += '</div></div>';
                });
        }

    }
}
