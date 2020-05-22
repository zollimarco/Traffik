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
char tempi_s1[3] = {5,2,9}; //0 G - 1 Y 2 R
char tempi_s2[3] = {5,2,9};

char tempo = 0,tempo2 = 0;
int t1,t2;
int count;
char decine, unita;

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
    t1 = 0; //stato semaforo1
    t2 = 2; //stato semaforo2

    while(1)
    {
        //stati dei semafori
        if(t1 == 0){
        PORTDbits.RD1 = 0; //red
        PORTDbits.RD2 = 1; //green
        PORTDbits.RD3 = 0; //blue
        }
        if(t2 == 0){
        PORTDbits.RD4 = 0; //red
        PORTDbits.RD5 = 1; //green
        PORTDbits.RD6 = 0; //blue
        
        }
        if (t1 == 1){
        PORTDbits.RD1 = 1; //red
        PORTDbits.RD2 = 1; //green
        PORTDbits.RD3 = 0; //blue
        }
        if(t2 == 1){
        PORTDbits.RD4 = 1; //red
        PORTDbits.RD5 = 1; //green
        PORTDbits.RD6 = 0; //blue
        }
        if (t1 == 2){
        PORTDbits.RD1 = 1; //red
        PORTDbits.RD2 = 0; //green
        PORTDbits.RD3 = 0; //blue
        }
        if(t2 == 2){
        PORTDbits.RD4 = 1; //red
        PORTDbits.RD5 = 0; //green
        PORTDbits.RD6 = 0; //blue
        
        }
        
        TRISD = 0x00;//imposto il registro a 00 per poter leggere gli slider
        int valore = read_ADC(6);
        char a = toString(t1);
        uart_print(a);
        uart_print('-');
        char b = toString(t2);
        uart_print(b);
        
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
            tempo2 ++; //inremento il tempo dei colori dei altri 2 semafori
            if (tempo > tempi_s1[t1]) //cambio dei colori della prima coppia dei semafori
            {
                tempo = 0; 
                t1 ++;    //incremento lo stato del semaforo
                if (t1 > 2){  
                    t1 = 0; //torno al verde
                    tempo2 = 0; //azzero il tempo del altro semaforo perchè si sballavano i tempi
                    //vedi registrazione PW 22/05/2020 prima ora
                }  
                
            }
            if(tempo2 > tempi_s2[t2]){               
                tempo2 = 0; 
                t2 ++;
                 
                if(t2 > 2){
                    t2 = 0;
                    tempo = 0;
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
