import { Component, OnInit } from '@angular/core';
import { HttpServiceService } from './http-service.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { timer, TimeInterval, Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { timeout, reject } from 'q';
import { resolve } from 'url';
import { stringify } from '@angular/core/src/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ HttpServiceService ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  errorElemento1: any;
  errorElemento2: any;
  errorElemento3: any;
  elemento1: string = "Estufa 1";
  elemento2: string = "Estufa 2";
  elemento3: string = "Sensor temperatura/humedad";
  title = 'IOTHome';
  estadoEstufa1: string;
  estadoEstufa2: string;
  datosSensor: string;

  activarEstufa1URL: string = "http://192.168.1.106/gpio/1";
  desactivarEstufa1URL: string = "http://192.168.1.106/gpio/0";
  estadoEstufa1URL: string = "http://192.168.1.106/gpio/estado";
  activarEstufa2URL: string = "http://192.168.1.107/gpio/1";
  desactivarEstufa2URL: string = "http://192.168.1.107/gpio/0";
  estadoEstufa2URL: string = "http://192.168.1.107/gpio/estado";
  ipTermometro: string = "http://192.168.1.112"


  constructor(private httpService: HttpServiceService){}

  ngOnInit(){
    this.estadoEstufa1 = 'Estado : indefinido';
    this.estadoEstufa2 = 'Estado : indefinido';
    //crear un observable con un intervalo y con map ejecuto lo que quiera
    //cada vez que se cumpla el intervalo.
    //x es el numero de veces que se ha ejecutado el intervalo
    let loopLectorSensor = interval(30000).pipe(
      map((x) => {
        //leer y procesar los datos del sensor de temperatura y humedad
        this.httpService.getHttpRequest(this.ipTermometro)
        .subscribe(
          (res: string) => {
            this.procesarRespuestaSensorTempHumedad1(res);
          } ,
          (error: HttpErrorResponse) => {
            this.procesarErrores(error.message, this.elemento3);
          }

        )
      })
    );

    let loopLectorEstufa1 = interval(30000).pipe(
      map((x) => {
        this.httpService.getHttpRequest(this.estadoEstufa1URL)
        .subscribe(
          (res: string) => {
            this.estadoEstufa1 = this.procesarRespuestaEstadoEstufas(res);
          },
          (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento1)
        )
      })
    );

    let loopLectorEstufa2 = interval(30000).pipe(
      map((x) => {
        this.httpService.getHttpRequest(this.estadoEstufa2URL)
        .subscribe(
          (res: string) => {
            this.estadoEstufa2 = this.procesarRespuestaEstadoEstufas(res);
          },
          (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento2)
        )
      })
    );

    loopLectorSensor.subscribe();
    loopLectorEstufa1.subscribe();
    loopLectorEstufa2.subscribe();
  }

  leerTemperatura(){
    this.httpService.getHttpRequest(this.ipTermometro)
    .subscribe(
      (res: string) => this.procesarRespuestaSensorTempHumedad1(res) ,
      (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento3)
    )
  }

  leerTemperatura2(){
    console.log("Prosesando lectura erronea");
    this.httpService.getHttpRequest("http://192.168.1.107/gpio/2")
    .subscribe(
      (res: string) => this.procesarRespuestaSensorTempHumedad1(res) ,
      (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento3)
    )
  }

  activarEstufa1(){
    this.httpService.getHttpRequest(this.activarEstufa1URL)
    .subscribe(
      (res: any) => this.estadoEstufa1 = this.procesarRespuestaEstadoEstufas(res),
      (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento1)
    )
  }

  desactivarEstufa1(){
    this.httpService.getHttpRequest(this.desactivarEstufa1URL)
    .subscribe(
      (res: any) => this.estadoEstufa1 = this.procesarRespuestaEstadoEstufas(res),
      (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento1)
    )
  }

  activarEstufa2(){
    this.httpService.getHttpRequest(this.activarEstufa2URL)
    .subscribe(
      (res: any) => this.estadoEstufa2 = this.procesarRespuestaEstadoEstufas(res),
      (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento2)
    )
  }

  desactivarEstufa2(){
    this.httpService.getHttpRequest(this.desactivarEstufa2URL)
    .subscribe(
      (res: any) => this.estadoEstufa2 = this.procesarRespuestaEstadoEstufas(res),
      (error: HttpErrorResponse) => this.procesarErrores(error.message, this.elemento2)
    )
  }

  procesarRespuestaSensorTempHumedad1(respuesta: string){
   let ini = respuesta.indexOf("<html>") + 6;
   let end = respuesta.indexOf("<br");
   this.datosSensor = respuesta.substring(ini, end);
  }

  procesarRespuestaEstadoEstufas(respuesta: string){
    // let ini = respuesta.indexOf("<html>") + 6;
    // let end = respuesta.indexOf("</html>");
    // return respuesta.substring(ini, end);
    console.log('Respuesta de las estufas correcta: ' + respuesta);
    return respuesta;
  }

  procesarErrores(error: string, elementoError: string){

    console.log(error);
    let cadenaError: string;


    if (error.includes("Http failure response")){
      cadenaError = "Fallo de conexión con el dispositivo " + elementoError;
    }else{
      cadenaError = error;
    }
    switch(elementoError){
      case this.elemento1:
        this.errorElemento1 = cadenaError;
        // esperar durante 5 segundos y luego borra el mensaje
        setTimeout( () => {
          this.errorElemento1 = null;
        },5000);
        break;
      case this.elemento2:
        this.errorElemento2 = cadenaError;
        // esperar durante 5 segundos y luego borra el mensaje
        setTimeout( () => {
          this.errorElemento2 = null;
        },5000);
        break;
      case this.elemento3:
        this.errorElemento3 = cadenaError;
        // esperar durante 5 segundos y luego borra el mensaje
        setTimeout( () => {
          this.errorElemento3 = null;
        },5000);
        break;
    }
  }

}
