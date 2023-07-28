import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Storage } from './models/Storage';
import { StorageService } from './services/Storage.service';
import { environment } from 'environments/environment';
import { Product } from '../product/models/Product';
import { LookUp } from 'app/core/models/lookUp';
import { ProductService } from '../product/services/Product.service';

declare var jQuery: any;

@Component({
	selector: 'app-storage',
	templateUrl: './storage.component.html',
	styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements AfterViewInit, OnInit {

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'createdDate', 'lastUpdatedDate', 'createdUserId', 'lastUpdatedUserId', 'status', 'isDeleted', 'productId', 'quantity', 'isRSale', 'update', 'delete'];

	storageList: Storage[];

	storage: Storage = new Storage();
	productList: Product[];

	storageAddForm: FormGroup;


	storageId: number;

	constructor(private storageService: StorageService, private productService: ProductService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) { }

	ngAfterViewInit(): void {
		this.getStorageList();
	}

	ngOnInit() {
		this.productService.getProductList().subscribe(data => {
			this.productList = data;
		})

		this.createStorageAddForm();
	}


	getStorageList() {
		this.storageService.getStorageList().subscribe(data => {
			this.storageList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}

	save() {

		if (this.storageAddForm.valid) {
			this.storage = Object.assign({}, this.storageAddForm.value)

			if (this.storage.id == 0)
				this.addStorage();
			else
				this.updateStorage();
		}

	}

	addStorage() {

		this.storageService.addStorage(this.storage).subscribe(data => {
			this.getStorageList();
			this.storage = new Storage();
			jQuery('#storage').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.storageAddForm);

		})

	}

	updateStorage() {

		this.storageService.updateStorage(this.storage).subscribe(data => {

			var index = this.storageList.findIndex(x => x.id == this.storage.id);
			this.storageList[index] = this.storage;
			this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
			this.storage = new Storage();
			jQuery('#storage').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.storageAddForm);

		})

	}

	createStorageAddForm() {
		this.storageAddForm = this.formBuilder.group({
			id: [0],
			
			productId: [0, Validators.required],
			quantity: [0, Validators.required],
			isRSale: [false, Validators.required]
		})
	}

	deleteStorage(storageId: number) {
		this.storageService.deleteStorage(storageId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.storageList = this.storageList.filter(x => x.id != storageId);
			this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
		})
	}

	getStorageById(storageId: number) {
		this.clearFormGroup(this.storageAddForm);
		this.storageService.getStorageById(storageId).subscribe(data => {
			this.storage = data;
			this.storageAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
			if (key == 'status')
				group.get(key).setValue(true);
			if (key == 'isDeleted')
				group.get(key).setValue(false);
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'quantity')
				group.get(key).setValue(0);
			if (key == 'isRSale')
				group.get(key).setValue(false);
		});
	}

	checkClaim(claim: string): boolean {
		return this.authService.claimGuard(claim)
	}

	configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
