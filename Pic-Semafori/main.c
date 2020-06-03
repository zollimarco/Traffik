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

#define _XTAL_FREQ 32000000

void init_ADC(); //inizializzazione degli slider
int read_ADC(int canale); //lettura valore slider

char okadc=0; //variabili di attesa per la lettura degli slider
char countadc=0;

void UART_init(int); // inizializzo la comunicazione con la seriale
void UART_TxChar(char); // invio una dato al terminale
void uart_print(char,char);

char *toString(int);
char str[5];// variabile string convertita

//tempi dei semafori
unsigned char DIM = 6;
int tempi[6] = {0,0,0,0,0,0};
char primaconfigurazione = 0;

char tempo = 1;
int stato=0;
int count;
char decine, unita;

//contatori vecoli
char countMoto = 0;     //pulsante RB0    ID 0110
char countAuto = 0;     //pulsante RB1    ID 0100
char countAutobus = 0;  //pulsante RB2    ID 0111
char countCamion = 0;   //pulsante RB3    ID 0101

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
char scalatura_temperatura(char);
char scalatura_pressione(char);

//ricezione dati
char byte1,byte2,byte3;
char datoarrivato = 0;

char pedoni1=0,pedoni2=0;



void main(void) {
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
    char temperatura;
    char umidita;
    int pressione;
    TRISB = 0xFF;
    
    while(1)
    {
        if(primaconfigurazione)
        {
        if(secondi >=60){
            minuti ++;
            secondi = 0;
            uart_print(0x07,countMoto);
            uart_print(0x05,countAuto);
            uart_print(0x08,countAutobus);
            uart_print(0x06,countCamion);
            
            countMoto = 0;
            countAuto = 0;
            countAutobus = 0;
            countCamion = 0;

        }
        
            //pressione = read_ADC(3) >> 2;
            //ValoreScalato2 = scalatura_pressione(pressione);
            //UART_TxChar(ValoreScalato2);
            
            
        if(minuti >= 15){
            minuti = 0;
            temperatura = read_ADC(0) >> 2;
            ValoreScalato1 = scalatura_temperatura(temperatura);
            uart_print(0x02,ValoreScalato1);
            umidita = read_ADC(1) >> 2;
            uart_print(0x03,umidita / 2.55);
            pressione = read_ADC(3) >> 2;
            ValoreScalato2 = scalatura_pressione(pressione);
            uart_print(0x04,ValoreScalato2);
            TRISD = 0x00;
        }
          count_seg++;
            
         if(count_seg>3)
             count_seg=0;
        
          if(old_stato != stato)
          //stati dei semafori
        semafori();
          
        //timer 7 segmenti
        timer();
        
        
        
        
        
       
        
        if(!PORTBbits.RB0 && old_RB0){
            int valore = read_ADC(3);
            
            if(valore < 250 && valore >= 0){
                countMoto++;
            }else if(valore >250 && valore < 500){
                countAuto++;
            }else if(valore >500 && valore < 750){
                countAutobus++;
            }else {
                countCamion++;
            }
        }
        old_RB0 = PORTBbits.RB0; //1
        
        if(!PORTBbits.RB1 && old_RB1){
            
            int valore = read_ADC(4);
            
            if(valore < 250 && valore >= 0){
                countMoto++;
            }else if(valore >250 && valore < 500){
                countAuto++;
            }else if(valore >500 && valore < 750){
                countAutobus++;
            }else {
                countCamion++;
            }
        }
        old_RB1 = PORTBbits.RB1;
        if(!PORTBbits.RB2 && old_RB2){
            
            int valore = read_ADC(5);
            
            if(valore < 250 && valore >= 0){
                countMoto++;
            }else if(valore >250 && valore < 500){
                countAuto++;
            }else if(valore >500 && valore < 750){
                countAutobus++;
            }else {
                countCamion++;
            }
        }
        old_RB2 = PORTBbits.RB2;
        if(!PORTBbits.RB3 && old_RB3){
            
            int valore = read_ADC(6);
            
            if(valore < 250 && valore >= 0){
                countMoto++;
            }else if(valore >250 && valore < 500){
                countAuto++;
            }else if(valore >500 && valore < 750){
                countAutobus++;
            }else {
                countCamion++;
            }
        }
        
        old_RB3 = PORTBbits.RB3;
        if(!PORTBbits.RB4 && old_RB4){
            UART_TxChar('a');
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
        if(datoarrivato == 1){
            if(byte1 == 0){
                tempi[byte2] = byte3;
                
            }
            
            datoarrivato = 0;
        }
    }
    return;
}

char scalatura_temperatura(char dato)
{
    char valoremin = 0;
    char valoremax = 255;
    char A = 0;
    char B = 65;
    char valore;
    
    valore = ((dato - valoremin) * (B - A))/((valoremax - valoremin) + A);
    
    return valore;
}
char scalatura_pressione(char dato)
{
    char valoremin = 0;
    char valoremax = 255;
    char A = 0;
    char B = 215;
    char valore;
    
    valore = ((dato - valoremin) * (B - A))/((valoremax - valoremin) + A);
    
    return valore;
}

void semafori(){
            switch(stato){
            case 0:
                // 1 Rosso  2 Verde.
                PORTC = 0x21;
                

                if(old_stato != stato){
                old_stato = stato;
                uart_print(0,0x02);  
                uart_print(1,0x00);
                }

            break;
            case 1:
                //PORTD = 0x32;    //1 Rosso 2 Giallo
                PORTC = 0x25;
                
                if(old_stato != stato){
                old_stato = stato;
                uart_print(0,0x02);  
                uart_print(1,0x01);
                }
            break;
            case 2:
            case 5:
                    //1Rosso 2Rosso
                  PORTC = 0x05;
                
                if(old_stato != stato){
                old_stato = stato;
                uart_print(0,0x02);  
                uart_print(1,0x02);
                }
            break;
            case 3:
                //1 Verde 2 Rosso
                PORTC = 0x06;
                if(old_stato != stato){
                old_stato = stato;
                uart_print(0,0x00);  
                uart_print(1,0x02);
                }
            break;
            case 4:
                //1 Giallo 2 Rosso
                PORTC = 0x07;
                
                if(old_stato != stato){
                old_stato = stato;
                uart_print(0,0x01);  
                uart_print(1,0x02);
                }
            break;
            
        }
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
                    valore2 = tempi[stato] - tempo;     //verde e giallo s2
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
                    valore = tempi[stato] - tempo; //verde e giallo s1
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
        if(primaconfigurazione)
        {
        count++;
        //7 Segemnti
        if(okadc)
            countadc++;
        if(countadc>1)
            okadc=0;
        
        
        if (count > 500) //interrupt si attiva ogni 2ms quindi mettendo 500 entra ogni 1 secondo
        {
            count = 0;
            cambio_tempo = 1;
            secondi ++;
            tempo ++; //incremento il tempo dei colori dei 2 semafori semaforo          
            if (tempo > tempi[stato]) //cambio dei colori della prima coppia dei semafori
            {
                tempo = 1; 
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

void uart_print(char sensore, char valore)
{
    char byte1 = 0xF0 | sensore ;
    char byte2 = id_incrocio;
    char byte3 = valore;

        UART_TxChar(byte1);
        UART_TxChar(byte2);
        UART_TxChar(byte3);
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