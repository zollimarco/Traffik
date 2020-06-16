#include <xc.h>


#define _XTAL_FREQ 32000000
#define ICLK PORTCbits.RC3
#define IDAT PORTCbits.RC4
#define TIDAT TRISCbits.TRISC4

void i2c_init(void);
void i2c_start(void);
void i2c_stop(void);
void i2c_wb(unsigned char val);
unsigned char i2c_rb(unsigned char ack);
void i2c_acktst(unsigned char val);


void i2c_init(void)
{
  TIDAT=0;
  ICLK=1;
  IDAT=1;
}

void i2c_start(void)
{
  ICLK=1;
  IDAT=1;
  IDAT=0;
  
}

void i2c_stop(void)
{
  ICLK=1;
  IDAT=0;
  
  IDAT=1;
  
}

void i2c_wb(unsigned char val)
{
  unsigned char i;
  ICLK=0;
  for(i=0;i<8;i++)
  {
    IDAT=((val>>(7-i))& 0x01);
    ICLK=1;
    
    ICLK=0;
  }	
  IDAT=1;
  
  ICLK=1;
  
  ICLK=0;
}

unsigned char i2c_rb(unsigned char ack)
{
  char i;
  unsigned char ret=0;

  ICLK=0;
  TIDAT=1;
  IDAT=1;
  for(i=0;i<8;i++)
  {
    ICLK=1;
    
    ret|=(IDAT<<(7-i));
    ICLK=0;
  }
  TIDAT=0;
  if(ack)
    IDAT=0;
  else
	IDAT=1;
  
  ICLK=1;
  
  ICLK=0;

  return ret;
}


 unsigned char tmp;

 unsigned char getd(unsigned char nn)
    {
     return ((nn & 0xF0)>>4)+0x30;
    }

    unsigned char getu(unsigned char nn)
    {
      return (nn  & 0x0F)+0x30;
    }
