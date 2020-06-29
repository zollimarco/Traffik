export class Semaphore {
    //props
    id: number;
    data: Date;
    umidita:number;
    pressione: number;
    strade: Road[];
    /**
     * ctor
     */
    constructor() {
        this.id = 0;
        this.data = new Date();
        this.umidita = 0;
        this.pressione = 0;
        this.strade = [];
    }
}

export class Road {
    id: number;
    stato: number;
    auto: number;
    moto: number;
    camion: number;
    
    constructor() {
        this.id = 0;
        this.stato = 0;
        this.auto = 0;
        this.moto = 0;
        this.camion = 0;        
    }
}
