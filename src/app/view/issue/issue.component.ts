import { Component } from '@angular/core';
import {Issue} from "../../dto/issue";
import {DatePipe} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import * as $ from "jquery";
import {Book} from "../../dto/book";
import {Member} from "../../dto/member";

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.scss']
})
export class IssueComponent {
  issueList: Array<Issue> = [];
  bookList: Array<Book> = [];
  memberList: Array<Member> = [];
  API_BASE_URL_ISSUE: string = 'http://localhost:8080/api/v1/issues';
  API_BASE_URL_BOOK: string = 'http://localhost:8080/api/v1/books';
  API_BASE_URL_MEMBER: string = 'http://localhost:8080/api/v1/members';
  return: string = 'All';
  id =  null;
  isbn: string = '';
  memberId: string = '';
  bookAvailable: boolean = false;
  memberAvailable: boolean = false;

  constructor(private http:HttpClient, private toastr: ToastrService) {
    http.get<Array<Issue>>(`${this.API_BASE_URL_ISSUE}`)
      .subscribe(issueList => {
        this.issueList = issueList
      }, (err) => {
        this.toastr.error("Can't fetch issues: " + err.statusText, 'Error');
      });

    http.get<Array<Book>>(`${this.API_BASE_URL_BOOK}`)
      .subscribe(bookList => this.bookList = bookList);

    http.get<Array<Member>>(`${this.API_BASE_URL_MEMBER}`)
      .subscribe(memberList => this.memberList = memberList);
  }

  getIssues(txtSearch: HTMLInputElement) {
    const searchText = txtSearch.value.trim();
    const query = (searchText) ? `?q=${searchText}`: "";
    this.http.get<Array<Issue>>(`${this.API_BASE_URL_ISSUE}` + query)
      .subscribe(issueList => {
        if(this.return === 'All'){
          this.issueList = issueList
        } else {
          this.issueList = issueList.filter(issue => issue.returned === 'NO');
        }
      }, (err) => {
        this.toastr.error("Can't fetch issues: "+err.statusText, 'Error');
      });
  }

  newIssue(txtIsbn: HTMLInputElement, txtMemberId: HTMLInputElement) {
    $('new-issue-modal').trigger;
    [txtIsbn, txtMemberId].forEach(txt => {
      txt.classList.remove('is-invalid', 'animate__shakeX');
      txt.value = '';
    })
    setTimeout(()=>txtIsbn.focus(),500);
  }

  issueBook(txtIsbn: HTMLInputElement, txtMemberId: HTMLInputElement, divs: HTMLDivElement[]) {
    if(!this.validData(txtIsbn, txtMemberId)){
      return
    }

    if(!this.bookAvailable || !this.memberAvailable){
      this.toastr.error("Enter correct details", 'Error');
      txtIsbn.value = '';
      txtMemberId.value = '';
      divs[0].innerText = '';
      divs[1].innerText = '';
      return;
    }

    const pipe = new DatePipe('en-US');
    const issueDate = pipe.transform(new Date(), 'yyyy-MM-dd');
    const dueDate = pipe.transform(new Date().setDate(new Date().getDate() + 10), 'yyyy-MM-dd');

    if(issueDate && dueDate) {
      const issue = new Issue(null, this.isbn, this.memberId, issueDate, dueDate, 0, 'NO');

      this.http.post<Issue>(`${this.API_BASE_URL_ISSUE}`, issue)
        .subscribe(result => {
          this.toastr.success('Successfully issue the book', 'Success');
          this.issueList.push(result);

          [txtIsbn, txtMemberId].forEach(txt => {
            txt.classList.remove('is-invalid', 'animate__shakeX');
            txt.value = '';
          })
          divs[0].innerText = '';
          divs[1].innerText = '';
          txtIsbn.focus();
        }, (err) => {
          this.toastr.error(err.error.message, 'Error');
          [txtIsbn, txtMemberId].forEach(txt => {
            txt.classList.remove('is-invalid', 'animate__shakeX');
            txt.value = '';
            divs[0].innerText = '';
            divs[1].innerText = '';
          });
          txtIsbn.focus();
        });
    }
  }


  private validData(txtIsbn: HTMLInputElement, txtMemberId: HTMLInputElement) {
    let valid = true;

    [txtIsbn, txtMemberId].forEach(txt => {
      txt.classList.remove('is-invalid', 'animate__shakeX');
    })

    if(!this.memberId){
      valid = this.invalidate(txtMemberId, "Member id can't be empty");
    } else if(!/^\d{9}[V]$/.test(this.memberId)) {
      valid = this.invalidate(txtMemberId, "Invalid Member id");
    }

    if(!this.isbn){
      valid = this.invalidate(txtIsbn, "ISBN can't be empty");
    } else if(!/^\d{13}$/.test(this.isbn)){
      valid = this.invalidate(txtIsbn, "Invalid ISBN");
    }

    return valid;
  }

  private invalidate(txt: HTMLInputElement, msg: string) {
    setTimeout(()=>txt.classList.add('is-invalid', 'animate__shakeX'),0);
    txt.select();
    $(txt).next().text(msg);
    return false;
  }


  checkBook(txtIsbn: HTMLInputElement, validFeedback1: HTMLDivElement) {
    txtIsbn.classList.remove('is-invalid', 'animate__shakeX');
    validFeedback1.innerText = '';
    this.bookAvailable = false;
    const isbn = txtIsbn.value;

    if(/^\d{13}$/.test(isbn)){
      const book1 = this.bookList.find(book => book.isbn === isbn);
      if(book1){
        validFeedback1.innerText = 'Available';
        this.bookAvailable = true;
      } else {
        validFeedback1.innerText = 'Not-Available';
        this.bookAvailable = false;
      }
    }
  }

  checkMember(txtMemberId: HTMLInputElement, validFeedback2: HTMLDivElement) {
    txtMemberId.classList.remove('is-invalid', 'animate__shakeX');
    validFeedback2.innerText = '';
    this.memberAvailable = false;
    const id = txtMemberId.value;

    if(/^\d{9}[Vv]$/.test(id)){
      const member1 = this.memberList.find(member => member._id === id);
      if(member1){
        validFeedback2.innerText = 'Available';
        this.memberAvailable = true;
      } else {
        validFeedback2.innerText = 'Not-Available';
        this.memberAvailable = false;
      }
    }
  }


  updateIssue(issue: Issue, u_id: HTMLInputElement, u_isbn: HTMLInputElement, u_memberId: HTMLInputElement,
              u_issueDate: HTMLInputElement, u_dueDate: HTMLInputElement, u_fine: HTMLInputElement) {
    if(issue.id){
      u_id.value = '' + issue.id;
    }
    u_isbn.value = issue.isbn;
    u_memberId.value = issue.memberId;
    u_issueDate.value = issue.issueDate;
    u_dueDate.value = issue.returnDate;

    const difference = new Date().getTime() - new Date(issue.issueDate).getTime();
    const days = Math.floor(difference/(1000 * 3600 * 24));

    if(days > 10){
      const cost = (days - 10) * 10;
      u_fine.value = '' + cost.toFixed(2);
    } else {
      u_fine.value = '0.00';
    }
  }

  returnBook(u_id: HTMLInputElement, u_fine: HTMLInputElement, inputs: HTMLInputElement[]) {
    inputs.push(u_id);
    inputs.push(u_fine);

    let valid = true;

    inputs.forEach(txt => {
      if(!txt.value) {
        valid = false;
      }
    })

    if(!valid){
      return
    }

    const issue = this.issueList.find(issue => +u_id.value === issue.id);
    const fine = +u_fine.value;

    const pipe = new DatePipe('en-US');
    const today = pipe.transform(new Date(), 'yyyy-MM-dd');

    if(issue && today){
      issue.returned = 'YES';
      issue.fine = fine;
      issue.returnDate = today;

      this.http.patch(`${this.API_BASE_URL_ISSUE}/`+ u_id.value, issue)
        .subscribe(result => {
          this.toastr.success('Successfully return the book', 'Success');
          const index = this.issueList.findIndex(issue1 => issue.id === issue1.id);
          this.issueList.splice(index, 1, issue);

          inputs.forEach(txt => {
            txt.value = '';
          })

        }, (err) => {
          this.toastr.error(err.error, 'Error');
        })
    } else {
      this.toastr.error('Something went wrong', 'Error');
    }
  }

  deleteIssue(id: number | null) {
    this.http.delete(`${this.API_BASE_URL_ISSUE}/${id}`)
      .subscribe(result => {
        this.toastr.success('Successfully delete the issue', 'Success');
        const index = this.issueList.findIndex(issue => issue.id == id);
        this.issueList.splice(index, 1);
      }, (err) => {
        this.toastr.error(err.error.message, 'Error');
      })
  }
}
