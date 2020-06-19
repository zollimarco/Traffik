/*
 * File:   main.c
 * Author: 123
 *
 * Created on 18 maggio 2020, 9.39
 */
#pragma config FOSC = HS        // Oscillator Selection bits (HS oscillator)
#pragma config WDTE = OFF       // Watchdog Timer Enable bit (WDT disabled)
#pragma config PWRTE = ON       // Power-up Timer Enable bit (PWRT enabled)
#pragma config BOREN = ON       // Brown-out Reset Enable bit (BOR enabled)
#pragma config LVP = ON         // Low-Voltage (Single-Supply) In-Circuit Serial Programming Enable bit (RB3/PGM pin has PGM function; low-voltage programming enabled)
#pragma config CPD = OFF        // Data EEPROM Memory Code Protection bit (Data EEPROM code protection off)
#pragma config WRT = OFF        // Flash Program Memory Write Enable bits (Write protection off; all program memory may be written to by EECON control)
#pragma config CP = OFF  

#include <xc.h>
#include "tempo.c"
// 7 Segmenti

#define SEGMENT_A 0x01
#define SEGMENT_B 0x02
#define SEGMENT_C 0x04
#define SEGMENT_D 0x08
#define SEGMENT_E 0x10
#define SEGMENT_F 0x20
#define SEGMENT_G 0x40 

#define CIFRA_0 SEGMENT_A | SEGMENT_B | SEGMENT_C | SEGMENT_D | SEGMENT_E | SEGMENT_F
#define CIFRA_1 SEGMENT_B | SEGMENT_C 
#define CIFRA_2 SEGMENT_A | SEGMENT_B | SEGMENT_D | SEGMENT_E |  SEGMENT_G
#define CIFRA_3 SEGMENT_A | SEGMENT_B | SEGMENT_C | SEGMENT_D | SEGMENT_G
#define CIFRA_4 SEGMENT_B | SEGMENT_C | SEGMENT_F | SEGMENT_G
#define CIFRA_5 SEGMENT_A | SEGMENT_C | SEGMENT_D | SEGMENT_F | SEGMENT_G
#define CIFRA_6 SEGMENT_A | SEGMENT_C | SEGMENT_D | SEGMENT_E | SEGMENT_F | SEGMENT_G
#define CIFRA_7 SEGMENT_A | SEGMENT_B | SEGMENT_C 
#define CIFRA_8 SEGMENT_A | SEGMENT_B | SEGMENT_C | SEGMENT_D | SEGMENT_E | SEGMENT_F | SEGMENT_G
#define CIFRA_9 SEGMENT_A | SEGMENT_B | SEGMENT_C | SEGMENT_D | SEGMENT_F | SEGMENT_G
#define CIFRA_A SEGMENT_A | SEGMENT_B | SEGMENT_C | SEGMENT_E | SEGMENT_F | SEGMENT_G
#define CIFRA_B SEGMENT_C | SEGMENT_D | SEGMENT_E | SEGMENT_F | SEGMENT_G
#define CIFRA_C SEGMENT_A | SEGMENT_D | SEGMENT_E | SEGMENT_F 
#define CIFRA_D SEGMENT_B | SEGMENT_C | SEGMENT_D | SEGMENT_E | SEGMENT_G
#define CIFRA_E SEGMENT_A | SEGMENT_D | SEGMENT_E | SEGMENT_F | SEGMENT_G
#define CIFRA_F SEGMENT_A | SEGMENT_E | SEGMENT_F | SEGMENT_G

const char numero[16] ={ CIFRA_0, CIFRA_1, CIFRA_2, CIFRA_3, CIFRA_4, CIFRA_5, CIFRA_6, CIFRA_7,
                         CIFRA_8, CIFRA_9, CIFRA_A, CIFRA_B, CIFRA_C, CIFRA_D, CIFRA_E, CIFRA_F };


char count_seg = 0;

const char id_incrocio = 0x00; 
const char gateway = 0xff;

#define _XTAL_FREQ 32000000

void init_ADC(); //inizializzazione degli slider
int read_ADC(int canale); //lettura valore slider

char okadc=0; //variabili di attesa per la lettura degli slider
char countadc=0;

void UART_init(int); // inizializzo la comunicazione con la seriale
void UART_TxChar(char); // invio una dato al terminale
void uart_print(char,int,char);

char *toString(int);
char str[5];// variabile string convertita

//tempi dei semafori
unsigned char DIM = 6;
int tempi[6] = {0,0,0,0,0,0};
char primaconfigurazione = 1;

char tempo = 0;
int stato=0;
int count;
char decine, unita;

//contatori vecoli
char countMoto = 0;     //pulsante RB0    ID 0110
char countAuto = 0;     //pulsante RB1    ID 0100
char countCamion = 0;   //pulsante RB3    ID 0101
char arrayMoto[4] = {0,0,0,0};
char arrayAuto[4] = {0,0,0,0};
char arraycamion[4] = {0,0,0,0};


//Tempo attesa semafori
char cambio_tempo = 0;
char decine_s1 = 0;
char decine_s2 = 0;
char unita_s1 = 0;
char unita_s2 = 0;
int valore = 0 , valore2 = 0;

char old_stato;

void timer();
void semafori();

//invio sensori
char minuti = 0;
char secondi = 0;
char old_RB0 ,old_RB1,old_RB2,old_RB3,old_RB4,old_RB5;
char ValoreScalato1,ValoreScalato2;

//ricezione dati
char byte1,byte2,byte3,byte4,byte5;
char datoarrivato = 0;

char pedoni1=0,pedoni2=0;
char secondiPrimaConfigurazione=30;
//tempo ora
unsigned char tmp;
volatile char date[10];
volatile char time[10];
char fascia_oraria [2][23];
char indice_fascia;
char rosso_comune = 2;
char giallo = 5;
void *orario();


void main(void) {
    
    //per test
    char i,c;
    
    for(i = 0 ; i< 2 ;i++){
        for(c = 0; c < 23;c++){
            fascia_oraria[i][c] = 2;
        }
    }
    
    
    
    TRISD = 0x00; //imposto il registro a 00 per poter leggere gli slider
    PORTD = 0x00;
    
    UART_init(9600); //inizializzo la ricezione del terminale
    init_ADC();
    
    //interrupt ogni 2ms
    INTCON = 0xE0;
    OPTION_REG = 0x06; 
    TMR0 = 131; 
    
    count = 0;
    stato = 0; //stato semaforo1
    
    old_stato = 99;
    int temperatura;
    char umidita;
    int pressione;
    TRISB = 0xFF;
    
    while(1)
    {
        if(primaconfigurazione)
        {
        if(secondi >=50){
            minuti ++;
            secondi = 0;
            char i = 0;
            
            for(i = 0; i<4; i++){
                uart_print(0x07,arrayMoto[i],i);
                uart_print(0x05,arrayAuto[i],i);
                uart_print(0x06,arraycamion[i],i);
            }
            
            for(i = 0; i<4;i++){
                arrayMoto[i] = 0;
                arrayAuto[i] = 0;
                arraycamion[i] = 0;
            }
           
        }
        
            //pressione = read_ADC(3) >> 2;
            //ValoreScalato2 = scalatura_pressione(pressione);
            //UART_TxChar(ValoreScalato2);
            
            
        if(secondi >= 50){
            secondi = 0;
            temperatura = read_ADC(0);
            
            uart_print(0x02,temperatura ,0);
            
            umidita = read_ADC(1) >> 2;
            uart_print(0x03,umidita / 2.55 ,0);
            
            pressione = read_ADC(2);
            uart_print(0x04,pressione ,0);
            TRISD = 0x00;
        }
          count_seg++;
            
        if(count_seg>3)
             count_seg=0;
        
        if(old_stato != stato || stato == 6)
            semafori();//stati dei semafori
          
        //timer 7 segmenti
        timer();
        

        
        if(!PORTBbits.RB0 && old_RB0){
            int valore = read_ADC(3);
            
            if(valore < 250 && valore >= 0){
                arrayMoto[0] ++;
            }else if(valore >250 && valore < 500){
                arrayAuto[0] ++;
            }else {
                arraycamion[0] ++;
            }
        }
        old_RB0 = PORTBbits.RB0; //1
        
        if(!PORTBbits.RB1 && old_RB1){
            
            int valore = read_ADC(4);
            
            if(valore < 250 && valore >= 0){
                arrayMoto[0] ++;
            }else if(valore >250 && valore < 500){
                arrayAuto[0] ++;
            }else {
                arraycamion[0] ++;
            }
        }
        old_RB1 = PORTBbits.RB1;
        if(!PORTBbits.RB2 && old_RB2){
            
            int valore = read_ADC(5);
            
            if(valore < 250 && valore >= 0){
                arrayMoto[0] ++;
            }else if(valore >250 && valore < 500){
                arrayAuto[0] ++;
            }else {
                arraycamion[0] ++;
            }
        }
        old_RB2 = PORTBbits.RB2;
        if(!PORTBbits.RB3 && old_RB3){
            
            int valore = read_ADC(6);
            
            if(valore < 250 && valore >= 0){
                arrayMoto[0] ++;
            }else if(valore >250 && valore < 500){
                arrayAuto[0] ++;
            }else {
                arraycamion[0] ++;
            }
        }
        
        old_RB3 = PORTBbits.RB3;
        if(!PORTBbits.RB4 && old_RB4){
            if(stato==0 && tempi[stato]-tempo>10 && pedoni1==0)
            {
                tempo+=5;
                pedoni1=1;
            }
        }
        old_RB4 = PORTBbits.RB4;
        
        if(!PORTBbits.RB5 && old_RB5){
            if(stato==3 && tempi[stato]-tempo>10 && pedoni2==0)
            {
                tempo+=5;
                pedoni2=1;
            }
            
        }
        old_RB5 = PORTBbits.RB5;
        }
        else
        {
            primaconfigurazione=1;
            for(char i =0;i<DIM;i++)
                if(tempi[i]==0)
                    primaconfigurazione=0;
        }
        
        if(!primaconfigurazione && secondiPrimaConfigurazione==30)
        {
            secondiPrimaConfigurazione=0;
            uart_print(9,0,0);
            secondiPrimaConfigurazione=0;
        }
        
        if(datoarrivato == 1){
            
            if(byte1 == id_incrocio && (byte3 & 0x0F)>=0 && (byte4>>3)>=0 && (byte4>>3)<24){   //controllo id incrocio    
                fascia_oraria[(byte3 & 0x0F)][byte4>>3] = byte5;
                
            }
            datoarrivato = 0;
        }
    }
    return;
}

void semafori(){
            switch(stato){
            case 0:
                // 1 Rosso  2 Verde.
                PORTC = 0x21;
                    
                orario();
                    //UART_TxChar('-');
                    //UART_TxChar(fascia_oraria[0][10]);
                    
                
                    if (tempi[0] == 0 || tempi[3] == 0){
                        stato = 6;
                    }
                    
                if(old_stato != stato){
                old_stato = stato;
                uart_print(1,0x02,0);  
                uart_print(1,0x00,1);
                }

            break;
            case 1:
                //PORTD = 0x32;    //1 Rosso 2 Giallo
                PORTC = 0x25;
                
                if(old_stato != stato){
                old_stato = stato;
                uart_print(1,0x02,0);  
                uart_print(1,0x01,1);
                }
            break;
            case 2:
            case 5:
                    //1Rosso 2Rosso
                  PORTC = 0x05;
                
                if(old_stato != stato){
                old_stato = stato;
                uart_print(1,0x02,0);  
                uart_print(1,0x02,1);
                }
            break;
            case 3:
                //1 Verde 2 Rosso
                PORTC = 0x06;
                if(old_stato != stato){
                old_stato = stato;
                uart_print(1,0x00,0);  
                uart_print(1,0x02,1);
                }
            break;
            case 4:
                //1 Giallo 2 Rosso
                PORTC = 0x07;
                
                if(old_stato != stato){
                old_stato = stato;
               uart_print(1,0x01,0);  
                uart_print(1,0x02,1);
                }
            break;
                case 6:
                    if((secondi % 2) == 0){
                        PORTC = 0x27;
                    }
                    else{
                        PORTC = 0x00;
                    }
                    
                    orario();
                    if (tempi[0] != 0 && tempi[3] != 0){
                        stato = 0;
                    }
                    break;
        }
}

void *orario(){
                    
    //Tempo / ora   
    i2c_start();
    i2c_wb(0xD0);
    i2c_wb(0);

    i2c_start();
    i2c_wb(0xD1);

    tmp= 0x7F & i2c_rb(1); //segundos
    time[5]=':';
    time[6]=getd(tmp);
    time[7]=getu(tmp);
    time[8]=0;

    tmp= 0x7F & i2c_rb(1); //minutos
    time[2]=':';
    time[3]=getd(tmp);
    time[4]=getu(tmp);

    tmp= 0x3F & i2c_rb(1); //horas
    time[0]=getd(tmp);
    time[1]=getu(tmp);

    i2c_stop();

    indice_fascia = ((time[0]-48)*10) + (time[1]-48);

    tempi[0] = fascia_oraria[1][indice_fascia];
    tempi[1] = giallo;
    tempi[2] = rosso_comune;
    tempi[3] = fascia_oraria[0][indice_fascia];
    tempi[4] = giallo;
    tempi[5] = rosso_comune;
    
   // return tempi;
}

void timer(){
        TRISD = 0x00;
        TRISA = 0x00;
        
        switch(count_seg){
            case 0:  //display 1
                PORTA= 0x20;
                PORTD=numero[unita_s1];
                break;
            case 1: //display 2
                PORTA=0x10;
                PORTD=numero[decine_s1];
                break;
            case 2: //display 3
                PORTA=0x08;
                PORTD=numero[unita_s2];
                break;
            case 3: //display 4
                PORTA=0x04;
                PORTD=numero[decine_s2];
                break;
        }
        
        //timer
        if(cambio_tempo == 1){
            cambio_tempo = 0;
            switch(stato){
                case 0:
                    valore = (tempi[0] + tempi[1] + tempi[2]) - tempo; //rosso s1
                    valore2 = tempi[stato] - tempo;     //verde e giallo s2
                    break;
                case 1:
                    valore = (tempi[1] + tempi[2]) - tempo; //rosso s1
                 valore2 = tempi[stato] - tempo;     //verde e giallo s2
                    break;
                case 2:
                    valore = (tempi[2]) - tempo; //rosso s1
                    valore2 = (tempi[stato]+tempi[3] + tempi[4] + tempi[5]) - tempo;     //verde e giallo s2
                    break;
                case 3:
                    valore2 = (tempi[3] + tempi[4] + tempi[5]) - tempo; //rosso s2
                    valore = tempi[stato] - tempo; //verde e giallo s1
                    break;
                case 4:
                    valore2 = (tempi[4] + tempi[5]) - tempo; //rosso s2
                    valore = tempi[stato] - tempo; //verde e giallo s1
                    break;
                case 5:
                    valore2 = (tempi[5]) - tempo; //rosso s2
                    valore = (tempi[stato]+tempi[0] + tempi[1] + tempi[2]) - tempo; //verde e giallo s1
                    break;
                case 6:
                    valore=0;
                    valore2=0;
                    break;
            }
            
            if(valore < 10) {
                decine_s1 = 0;
                unita_s1 = valore;
            
            }else{
                if(valore<99)
                {
                    decine_s1 = valore /10;
                    unita_s1 = valore % 10;
                }
                else
                {
                    decine_s1 = 9;
                    unita_s1 = 9;
                }
            }
            if(valore2 < 10) {
                decine_s2 = 0;
                unita_s2 = valore2;
            
            }else{
                if(valore2<99)
                {
                    decine_s2 = valore2 /10;
                    unita_s2 = valore2 % 10;
                }else
                {
                    decine_s2 = 9;
                    unita_s2 = 9;
                }
            }
            
        }
}

void __interrupt() ISR()
{
    if (INTCON&0x04)
    {
        INTCON &= ~0x04;
        
            count++;
            //7 Segemnti
            if(okadc)
                countadc++;
            if(countadc>1)
                okadc=0;


        if (count > 500) //interrupt si attiva ogni 2ms quindi mettendo 500 entra ogni 1 secondo
        {
                
            count = 0;
            if(!primaconfigurazione)
                secondiPrimaConfigurazione++;
            if(primaconfigurazione)
            {
                cambio_tempo = 1;
                secondi ++;
                tempo ++; //incremento il tempo dei colori dei 2 semafori semaforo          
                if (tempo >= tempi[stato]) //cambio dei colori della prima coppia dei semafori
                {
                    if(stato != 6){
                        tempo = 0; 
                        stato ++;    //incremento lo stato del semaforo
                        pedoni1=0;
                        pedoni2=0;
                        if (stato >= DIM){  
                            stato = 0; //torno al verde
                        }
                    }

                }
            }
        }
    }
    TMR0 = 131;
    
    if(RCIF)
    {
        while(!RCIF);
        RCIF = 0;
        byte1 = RCREG;
        while(!RCIF);
        RCIF = 0;
        byte2 = RCREG;
        while(!RCIF);
        RCIF = 0;
        byte3 = RCREG;
        while(!RCIF);
        RCIF = 0;
        byte4 = RCREG;
        while(!RCIF);
        RCIF = 0;
        byte5 = RCREG;
        datoarrivato = 1;
    }
    
    return;
}

void init_ADC(){
    TRISA = 0xFF;
    ADCON0 = 0b00000001;
    ADCON1 = 0b10000000;
    __delay_ms(10);
}

void uart_print(char sensore, int valore, char strada)
{
    
    byte1 = gateway ; //destinatario
    byte2 = id_incrocio ; //mittente  
    if(sensore == 0x02 || sensore == 0x04)
    {
        byte3= sensore<<4;
        byte4 =  (valore>>8&0x03);
        byte5 = valore;
    }
    else
    {
        
        byte3 = sensore<<4 | (strada&0x0F);
        byte4 = (valore>>8&0x03);
        byte5 = valore;
    }

    UART_TxChar(byte1);
    UART_TxChar(byte2);
    UART_TxChar(byte3);
    UART_TxChar(byte4);
    UART_TxChar(byte5);
}

char *toString(int n){
        //n=n/10.23;
        char m = n/1000;
        char c = (n-m*1000)/100;
        char d = (n-(m*1000)-(c*100))/10;
        char u = n-(m*1000)-(c*100)-(d*10);

        if(m==0)
            m=32;
        else
            m+='0';
        
        
        if(c==0 && m==32)
            c=32;
        else
            c+='0';
        if(d==0 && c==32 && m==32)
            d=32;
        else
            d+='0';
        u+='0';
        
        str[0]=m;
        str[1]=c;
        str[2]=d;
        str[3]=u;
        str[4]='\0';
        return str;
}

int read_ADC(int canale)
{
    TRISA = 0xFF;
    
    okadc=1;
    while(okadc)
    {
    }
    
    ADCON0 = 0b00000001;//ADCON0 = & 0b11000111;
    ADCON0= ADCON0 | canale<<3;
    ADCON0=ADCON0 | 0b00000100;    
    while(ADCON0 & 0b00000100)
    {}
    int valore = ADRESL+(ADRESH<<8);
    okadc=0;
    countadc=0;
    return valore;
}

void UART_init (int baudrate){
    TRISC = 0x80;
    //TXSTAbits.TXEN = 1;
    TXSTA = 0x20;
    RCSTA = 0x90; //per la ricezione
    SPBRG = (_XTAL_FREQ/(long)(64UL *baudrate)) -1;
    INTCONbits.GIE = 1;
    INTCONbits.PEIE =1;
    PIE1bits.RCIE =1;
}

void UART_TxChar(char ch)
{
    while(!TXIF);
    TXIF=0;
    TXREG=ch;
}