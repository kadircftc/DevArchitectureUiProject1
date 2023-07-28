import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Storage } from '../models/Storage';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private httpClient: HttpClient) { }


  getStorageList(): Observable<Storage[]> {

    return this.httpClient.get<Storage[]>(environment.getApiUrl + '/storages/getall')
  }

  getStorageById(id: number): Observable<Storage> {
    return this.httpClient.get<Storage>(environment.getApiUrl + '/storages/getbyid?id='+id)
  }

  addStorage(storage: Storage): Observable<any> {

    return this.httpClient.post(environment.getApiUrl + '/storages/', storage, { responseType: 'text' });
  }

  updateStorage(storage: Storage): Observable<any> {
    return this.httpClient.put(environment.getApiUrl + '/storages/', storage, { responseType: 'text' });

  }

  deleteStorage(id: number) {
    return this.httpClient.request('delete', environment.getApiUrl + '/storages/', { body: { id: id } });
  }


}