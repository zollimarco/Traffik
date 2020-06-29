export class SensorData {
    //props
    id_incrocio: number;
    Sensore: string;
    Strada: number;
    Data: Date;
    Fascia_Oraria: number;
    Valore: number;
    //ctor
    constructor() {
        this.id_incrocio = 0;
        this.Sensore = "";
        this.Strada = 0;
        this.Data = new Date();
        this.Fascia_Oraria = 0;
        this.Valore = 0;
    }
}
