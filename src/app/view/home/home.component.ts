import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {Member} from "../../dto/member";
import {Book} from "../../dto/book";
import {Issue} from "../../dto/issue";
import * as $ from "jquery";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  totalMembers: string = '';
  totalBooks: string = '';
  totalIssues: string = '';
  totalFines: string = '';
  availableBooks: string = '';
  issuedBooks: string = '';
  memberAvailable: string = '';
  totalBookCount: number = 0;
  issueList: Array<Issue> = [];
  bookList: Array<Book> = [];
  API_BASE_URL_ISSUE: string = 'http://localhost:8080/api/v1/issues';
  API_BASE_URL_BOOK: string = 'http://localhost:8080/api/v1/books';
  API_BASE_URL_MEMBER: string = 'http://localhost:8080/api/v1/members';

  constructor(private http:HttpClient, private toastr: ToastrService) {
    this.getMembers()
    this.getBooks()
    this.getIssues()
  }

  getMembers(){
    this.http.get<Array<Member>>(`${this.API_BASE_URL_MEMBER}`)
      .subscribe(memberList => {
        this.totalMembers = '' + memberList.length
      }, (err) => {
        this.toastr.error("Can't fetch members: " + err.statusText, 'Error');
      })
  }

  getBooks(){
    this.http.get<Array<Book>>(`${this.API_BASE_URL_BOOK}`)
      .subscribe(bookList => {
        this.bookList = bookList;
        let count = 0;
        bookList.forEach(book =>{
          count += book.copies
        })
        this.totalBookCount = count;
        this.totalBooks = '' + count;
      }, (err) => {
        this.toastr.error("Can't fetch books: " + err.statusText, 'Error');
      })
  }

  getIssues(){
    this.http.get<Array<Issue>>(`${this.API_BASE_URL_ISSUE}`)
      .subscribe(issueList => {
        this.issueList = issueList;
        this.totalIssues = '' + issueList.length
        this.getTotalFines();
        this.getIssuedBooks();
      }, (err) => {
        this.toastr.error("Can't fetch issues: " + err.statusText, 'Error');
      })
  }


  private getTotalFines() {
    let total = 0;
    this.issueList.forEach(issue => {
      total += issue.fine;
    })
    this.totalFines = '' + total;
  }

  private getIssuedBooks() {
    const issues = this.issueList.filter(issue => issue.returned === 'NO');
    this.issuedBooks = '' + issues.length;
    setTimeout(() => this.getAvailableBooks(issues.length), 10);
  }

  private getAvailableBooks(issueCount: number) {
    this.availableBooks = '' + (this.totalBookCount - issueCount);
  }

  checkMember(txtId: HTMLInputElement, memberLabel: HTMLDivElement) {
    const id = txtId.value;

    txtId.classList.remove('is-invalid', 'animate__shakeX');

    if(!id){
      this.invalidate(txtId, "Member id can't be empty");
      return;
    } else if (!/^\d{9}[Vv]$/.test(id)){
      this.invalidate(txtId, "Invalid member id");
      return;
    } else {
      this.http.get<Member>(`${this.API_BASE_URL_MEMBER}/` + id)
        .subscribe(result =>{
          memberLabel.innerText = 'Available';
        }, (err) => {
          memberLabel.innerText = err.statusText;
        });
    }
  }

  private invalidate(txt: HTMLInputElement, msg: string) {
    setTimeout(()=>txt.classList.add('is-invalid', 'animate__shakeX'),0);
    txt.select();
    $(txt).next().text(msg);
  }

  bookAvailable(txtIsbn: HTMLInputElement, bookLabel: HTMLDivElement) {
    const isbn = txtIsbn.value;

    txtIsbn.classList.remove('is-invalid', 'animate__shakeX');

    if(!isbn){
      this.invalidate(txtIsbn, "ISBN can't be empty");
      return;
    } else if (!/^\d{13}$/.test(isbn)) {
      this.invalidate(txtIsbn, "Invalid ISBN");
      return;
    } else {
      const book1 = this.bookList.find(book => book.isbn == isbn);
      if(!book1){
        bookLabel.innerText = "Doesn't exist";
        return;
      }

      let totalCount = 0;

      this.http.get<Book>(`${this.API_BASE_URL_BOOK}/` + isbn)
        .subscribe(result =>{
          totalCount = result.copies;
        });

      this.http.get<number>(`${this.API_BASE_URL_ISSUE}/book/return/` + isbn)
        .subscribe(result => {
          if(totalCount > result ){
            bookLabel.innerText = "Available";
          } else {
            bookLabel.innerText = "Not Available";
          }
        })
    }
  }
}
