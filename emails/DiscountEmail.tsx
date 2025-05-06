// emails/DiscountEmail.tsx
import { 
    Body, Container, Head, Heading, Html, Img, Link, Section, Text 
  } from '@react-email/components';
  
  interface EmailTemplateProps {
    discountCode: string;
  }
  
  export const EmailTemplate = ({ discountCode }: EmailTemplateProps) => (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', margin: '0', padding: '0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading as="h1" style={{ color: '#333', textAlign: 'center' }}>
            Your Exclusive 10% Discount
          </Heading>
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333' }}>
            Thank you for subscribing! Here's your discount code:
          </Text>
          <Section style={{ 
            background: '#f4f4f4', 
            padding: '15px', 
            textAlign: 'center',
            margin: '20px 0',
            borderRadius: '5px'
          }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {discountCode}
            </Text>
          </Section>
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333' }}>
            Simply enter this code at checkout to get 10% off your order.
          </Text>
          <Section style={{ textAlign: 'center', margin: '30px 0 15px' }}>
            <Link 
              href="https://noir-clothing.com/all" 
              style={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '3px',
                fontWeight: 'bold'
              }}
            >
              SHOP NOW
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );