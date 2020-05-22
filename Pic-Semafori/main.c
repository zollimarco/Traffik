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

#define _XTAL_FREQ 32000000

void init_ADC(); //inizializzazione degli slider
int read_ADC(int canale); //lettura valore slider

void UART_init(int); // inizializzo la comunicazione con la seriale
void UART_TxChar(char); // invio una dato al terminale
void uart_print(char *);

char *toString(int);
char str[5];// variabile string convertita

//tempi dei semafori
unsigned char DIM = 6;
char tempi[6] = {5,2,2,5,2,2};

char tempo = 0;
int stato;
int count;
char decine, unita;

//contatori vecoli
char countMoto = 0;     //pulsante RB0    ID 0110
char countAuto = 0;     //pulsante RB1    ID 0100
char countAutobus = 0;  //pulsante RB2    ID 0111
char countCamion = 0;   //pulsante RB3    ID 0101

void main(void) {
    TRISD = 0x00;
    PORTD = 0x00;
    
    UART_init(9600); //inizializzo la ricezione del terminale
    init_ADC();
    
    //interrupt ogni 2ms
    INTCON = 0xE0;
    OPTION_REG = 0x06; 
    TMR0 = 131; 
    
    count = 0;
    stato = 0; //stato semaforo1
    
    while(1)
    {
        //stati dei semafori
        switch(stato){
            case 0:
                PORTD = 0x22; // 1 Rosso  2 Verde
            break;
            case 1:
                PORTD = 0x32;    //1 Rosso 2 Giallo
            break;
            case 2:
            case 5:
                PORTD = 0x12;       //1Rosso 2Rosso
            break;
            case 3:
                 PORTD = 0x14;   //1 Verde 2 Rosso
            break;
            case 4:
                PORTD = 0x16;   //1 Giallo 2 Rosso
            break;
            
        }
        
        
        TRISD = 0x00;//imposto il registro a 00 per poter leggere gli slider
        int valore = read_ADC(6);
        //char a = toString(stato);
        //uart_print(a);
        TRISB = 0xFF;
        if(!PORTBbits.RB0){
            __delay_ms(40);
            
            countMoto++;
        }
        if(!PORTBbits.RB1){
            __delay_ms(40);
            countAuto++;
        }
        if(!PORTBbits.RB2){
            __delay_ms(40);
            countAutobus++;
        }
        if(!PORTBbits.RB3){
            __delay_ms(40);
            countCamion++;
        }
    }
    return;
}

void __interrupt() ISR()
{
    if (INTCON&0x04)
    {
        INTCON &= ~0x04;
        count++;
        
        if (count > 500) //interrupt si attiva ogni 2ms quindi mettendo 500 entra ogni 1 secondo
        {
            count = 0;

            tempo ++; //incremento il tempo dei colori dei 2 semafori semaforo          
            if (tempo > tempi[stato]) //cambio dei colori della prima coppia dei semafori
            {
                tempo = 0; 
                stato ++;    //incremento lo stato del semaforo
                if (stato > DIM){  
                    stato = 0; //torno al verde
                }  
                
            }
        }
    }
    TMR0 = 131;
    return;
}

void init_ADC(){
    TRISA = 0xFF;
    ADCON0 = 0b00000001;
    ADCON1 = 0b10000000;
    __delay_ms(10);
}

void uart_print(char *str)
{
    int i=0;
    
    while(str[i] != '\0')
    {
        UART_TxChar(str[i]);
        i++;
    }
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
    ADCON0 = 0b00000001;//ADCON0 = & 0b11000111;
    ADCON0= ADCON0 | canale<<3;
    ADCON0=ADCON0 | 0b00000100;    
    while(ADCON0 & 0b00000100)
    {}
    int valore = ADRESL+(ADRESH<<8);
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