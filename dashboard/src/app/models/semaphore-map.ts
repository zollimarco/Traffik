 export class SemaphoreMap {
    coordinates:Coordinates;
    size: Size;
    zoom: number;
    constructor() {
        this.coordinates = new Coordinates();
        this.size = new Size()
        this.zoom = 0;
    }
}
export class Size{
    width: number;
    height: number;
    constructor() {
        this.width = 0;
        this.height = 0;
    }
}
export class Coordinates{
    latitude: number;
    longitude: number;
    constructor() {
        this.latitude = 0;
        this.longitude = 0;
    }
}