export class CrossRoad {
    //props
    id: number;
    date: Date;
    humidity:number;
    pressure: number;
    temperature: number;
    semaphores: Semaphore[];
    /**
     * ctor
     */
    constructor() {
        this.id = 0;
        this.date = new Date();
        this.humidity = 0;
        this.pressure = 0;
        this.temperature = 0;
        this.semaphores = [];
    }
}

export class Semaphore {
    id: number;
    state: number;
    car: number;
    moto: number;
    camion: number;
    
    constructor() {
        this.id = 0;
        this.state = 0;
        this.car = 0;
        this.moto = 0;
        this.camion = 0;        
    }
}
