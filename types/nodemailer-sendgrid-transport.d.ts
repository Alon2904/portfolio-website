// types/nodemailer-sendgrid-transport.d.ts

declare module 'nodemailer-sendgrid-transport' {
    import { Transport, SendMailOptions } from 'nodemailer';
  
    interface Options {
      auth: {
        api_key: string;
      };
    }
  
    function sendgridTransport(options: Options): Transport;
  
    export default sendgridTransport;
  }
  