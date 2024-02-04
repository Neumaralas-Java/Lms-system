import {Component} from '@angular/core';
import * as $ from 'jquery';
import {Member} from "../../dto/member";
import {HttpClient} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent {
  memberList: Array<Member> = [];
  btnText: string = 'Save Member';
  modelTitle: string = 'Add New Member';
  API_BASE_URL: string = 'http://localhost:8080/api/v1/members';

  constructor(private http:HttpClient, private toastr: ToastrService) {
    http.get<Array<Member>>(`${this.API_BASE_URL}`)
      .subscribe(memberList => {
        this.memberList = memberList
      }, (err) => {
        this.toastr.error("Can't fetch members: "+err.statusText, 'Error');
      });
  }


  newMember(txtId: HTMLInputElement, txtName: HTMLInputElement, txtContact: HTMLInputElement, txtAddress: HTMLInputElement) {
    $('#new-customer-modal').trigger
    this.btnText = 'Save Member';
    this.modelTitle = 'Add New Member';
    txtId.removeAttribute('disabled');
    this.resetForm(txtId, txtName, txtContact, txtAddress, true);
    setTimeout(()=>txtId.focus(),500);
  }

  resetForm(txtId:HTMLInputElement, txtName:HTMLInputElement, txtContact:HTMLInputElement, txtAddress:HTMLInputElement, flag:boolean){
    [txtId, txtName, txtAddress, txtContact].forEach(txt => {
      txt.classList.remove('is-invalid', 'animate__shakeX')
      if(flag) txt.value = '';
    })
  }


  deleteMember(id: string | null) {
    this.http.delete(`${this.API_BASE_URL}/${id}`)
      .subscribe(result => {
        this.toastr.success('Successfully delete the member', 'Success');
        const index = this.memberList.findIndex(member => member._id == id);
        this.memberList.splice(index, 1);
      }, (err) => {
        this.toastr.error(err.error, 'Error');
      })
  }

  saveMember(txtId: HTMLInputElement, txtName: HTMLInputElement, txtAddress: HTMLInputElement, txtContact: HTMLInputElement) {
    const id = txtId.value;
    const name = txtName.value;
    const address = txtAddress.value;
    const contact = txtContact.value;

    if (!this.validateData(txtId, txtName, txtContact, txtAddress)) {
      return;
    }

    const member = new Member(id, name, address, contact);

    if(this.btnText === 'Save Member'){
      this.http.post(`${this.API_BASE_URL}`, member)
        .subscribe(result =>{
          this.toastr.success('Successfully save the member', 'Success');
          this.memberList.push(member);
          this.resetForm(txtId, txtName, txtContact, txtAddress, true);
          txtId.focus();
        }, (err) => {
          this.toastr.error(err.error, 'Error');
        })
    } else {
      this.http.patch(`${this.API_BASE_URL}/${id}`, member)
        .subscribe((result) => {
          this.toastr.success('Successfully update the member', 'Success');
          const index = this.memberList.findIndex(member => member._id == id);
          this.memberList.splice(index, 1, member);
          this.newMember(txtId, txtName, txtContact, txtAddress);
        }, (err) => {
          this.toastr.error(err.error, 'Error');
        });
    }
  }

  validateData(txtId: HTMLInputElement, txtName: HTMLInputElement, txtContact: HTMLInputElement, txtAddress: HTMLInputElement){
    const id = txtId.value.trim();
    const name = txtName.value.trim();
    const address = txtAddress.value.trim();
    const contact = txtContact.value.trim();
    let valid = true;
    this.resetForm(txtId, txtName, txtContact, txtAddress, false);

    if(!address){
      valid = this.invalidate(txtAddress, "Address can't be empty")

    } else if(!/^.{3,}$/.test(address)){
      valid = this.invalidate(txtAddress, "Invalid address")
    }

    if(!contact){
      valid = this.invalidate(txtContact, "Contact can't be empty")

    } else if(!/^\d{3}-\d{7}$/.test(contact)){
      valid = this.invalidate(txtContact, "Invalid Contact number")
    }

    if(!name){
      valid = this.invalidate(txtName, "Name can't be empty")

    } else if(!/^[A-za-z ]+$/.test(name)){
      valid = this.invalidate(txtName, "Invalid name")
    }

    if(!id){
      valid = this.invalidate(txtId, "ID can't be empty")

    } else if(!/^\d{9}[Vv]$/.test(id)){
      valid = this.invalidate(txtId, "Invalid ID")
    }

    return valid;
  }


  invalidate(txt: HTMLInputElement, msg: string){
    setTimeout(()=>txt.classList.add('is-invalid', 'animate__shakeX'),0);
    txt.select();
    $(txt).next().text(msg);
    return false;
  }

  updateMember(member: Member, txtId: HTMLInputElement, txtName: HTMLInputElement, txtContact: HTMLInputElement, txtAddress: HTMLInputElement) {
    $('btn-new-member').trigger;
    txtId.value = member._id;
    txtName.value = member.name;
    txtContact.value = member.contact;
    txtAddress.value = member.address;
    this.btnText = 'Update Member';
    this.modelTitle = 'Update the Member';
    txtId.setAttribute('disabled', 'true');
    setTimeout(()=>txtName.focus(),500);
  }

  getMembers(txtSearch: HTMLInputElement) {
    const searchText = txtSearch.value.trim();
    const query = (searchText) ? `?q=${searchText}`: "";
    this.http.get<Array<Member>>(`${this.API_BASE_URL}` + query)
      .subscribe(memberList => {
        this.memberList = memberList
      }, (err) => {
        this.toastr.error("Can't fetch members: "+err.statusText, 'Error');
      });

  }
}
