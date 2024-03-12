"use strict";

// IIFE - Immediately Invoked Function Expression
// AKA  - Anonymous Self-Executing Function
// Any code within the IIFE is immediately and automatically invoked
(function(){

    /**
     *  Binds click, mouseover, and mouseout events to anchor tags with class 'link' and a matching data attribute.
     *  Applies CSS changes for visual feedback and handles link activation on click.    *
     *  @param {string} link
     *  @returns {void}
     */
    function AddLinkEvents(link: string): void {
        // find all anchor tags with the class link that also have a data attribute equal
        // to whatever the link variable's value is
        let linkQuery = $(`a.link[data=${link}]`);

        //remove all link events from event queue
        linkQuery.off("click");
        linkQuery.off("mouseover");
        linkQuery.off("mouseout");

        //add css to adjust the link aesthetics
        linkQuery.css("text-decoration", "underline");
        linkQuery.css("color", "blue");

        // add link events
        linkQuery.on("click", function () {
            LoadLink(`${link}`);
        });

        linkQuery.on("mouseover", function () {
            $(this).css("cursor", "pointer");
            $(this).css("font-weight", "bold");
        });

        linkQuery.on("mouseout", function () {
            $(this).css("font-weight", "normal");
        });
    }

    /**
     * Sets up event listeners for navigation links found within list items of unordered lists.
     * Removes any existing click and mouseover events before adding new ones to control navigation behavior and visual cues.
     *
     * @returns {void} - This function does not return a value.
     */
    function AddNavigationEvents(): void {
        let navLinks = $("ul>li>a"); //find all navigation link

        //remove navigation events - empty event queue
        navLinks.off("click");
        navLinks.off("mouseover");

        //loop through each navigation link and load appropriate content on click
        navLinks.on("click", function () {
            LoadLink($(this).attr("data") as string);
        });

        navLinks.on("mouseover", function () {
            $(this).css("cursor", "pointer");
        });
    }

    /**
     * Updates the application's current active link, manages authentication, and updates browser history and page title.
     * It also updates navigation UI to reflect the current active link and loads corresponding content.
     *
     * @param {string} link - The new active link to be loaded and displayed in the browser's address bar.
     * @param {string} [data=""] - Optional additional data to associate with the link; defaults to an empty string.
     * @returns {void} - This function does not return a value.
     */
    function LoadLink(link: string, data: string = ""): void {
        router.ActiveLink = link;

        AuthGuard();

        router.LinkData = data;

        //history.pushState --> browser url gets swap/updated
        //used to manipulate the browser's session history stack
        history.pushState({}, "", router.ActiveLink);

        //obtained from LoadHeader
        document.title = capitalizeFirstLetter(router.ActiveLink);

        $("ul>li>a").each(function () {
            $(this).removeClass("active");
        });

        $(`li>a:contains(${document.title})`).addClass("active");

        LoadContent();
    }

    function AuthGuard(){
        let protected_routes = ["contact-list"]

        if(protected_routes.indexOf(router.ActiveLink) > -1){
            if(!sessionStorage.getItem("user")) {
                router.ActiveLink = "login";
            }
        }
    }

    function CheckLogin(){

        if(sessionStorage.getItem("user")){
            $("#login").html(` <a id="logout" class="nav-link" href="#">
                                                        <i class="fas fa-sign-out-alt"></i> Logout</a>`)
        }

        $("#logout").on("click", function() {
            sessionStorage.clear()

            // Lesson 9.2
            $("#login").html(`<a class="nav-link" data="login">
                                <i class="fas fa-sign-in-alt"></i> Login</a>`);

            AddNavigationEvents();

            LoadLink("login");
        });

    }

    /******
     function LoadHeader(html_data)
     {
        $("header").html(html_data);
        $(`li>a:contains(${document.title})`).addClass("active").attr("aria-current", "page");
        CheckLogin();
    }
     ****/

    function ContactFormValidation()
    {
        ValidateField("#fullName",
            /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]+)+([\s,-]([A-z][a-z]+))*$/,
            "Please enter a valid first and lastname.");

        ValidateField("#contactNumber",
            /^(\+\d{1,3}[\s-.])?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]\d{4}$/,
            "Please enter a valid phone contact number.");

        ValidateField("#emailAddress",
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,10}$/,
            "Please enter a valid email address");

        //let test = /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]+)+([\s,-]([A-z][a-z]+))*$/
    }


    /**
     * Week 5-2 Updates
     * @param input_field_id
     * @param regular_expression
     * @param error_message
     */
    function ValidateField(input_field_id:string, regular_expression:RegExp, error_message:string){
        let messageArea = $("#messageArea").hide();

        //The "blur" event fires when an element has lost focus.
        $(input_field_id).on("blur", function() {
            let inputFieldText:string = $(this).val() as string;
            if(!regular_expression.test(inputFieldText)){
                $(this).trigger("focus").trigger("select");
                messageArea.addClass("alert alert-danger").text(error_message).show();
            }else {
                messageArea.removeAttr("class").hide();
            }

        });
    }

    function AddContact(fullName:string, contactNumber:string, emailAddress:string){
        let contact: core.Contact = new core.Contact(fullName, contactNumber, emailAddress);
        if(contact.serialize()){
            let key = contact.fullName.substring(0,1) + Date.now();
            localStorage.setItem(key, contact.serialize() as string);
        }
    }

    function DisplayHomePage(){
        console.log("Called DisplayHomePage()");

        //Week 4-1
        $("#AboutUsBtn").on("click", () => {
            LoadLink("about");
        });

        $("main").append(`<p id="MainParagraph" class="mt-3">This is my main paragraph</p>`);
        //UPDATE 9.2 main and no remove class container!!!
        $("main").append(`<article">
                             <p id="ArticleParagraph" class="mt-3">This is my article paragraph</p></article>`);

    }

    function DisplayProductsPage(){
        console.log("Called DisplayProductPage()");
    }

    function DisplayAboutUsPage(){
        console.log("Called DisplayAboutUsPage()");
    }

    function DisplayServicesPage(){
        console.log("Called DisplayServicesPage()");
    }


    function DisplayContactUsPage(){
        console.log("Called DisplayContactUsPage()");

        $("a[data='contact-list']").off("click");
        $("a[data='contact-list']").on("click", function () {
            LoadLink("contact-list");
        });

        ContactFormValidation();

        let sendButton = document.getElementById("sendButton") as HTMLElement;
        let subscribeCheckbox = document.getElementById("subscribeCheckbox") as HTMLInputElement;

        sendButton.addEventListener("click", function ()
        {
            if(subscribeCheckbox.checked){

                //UPDATE
                let fullName:string = document.forms[0].fullName.value;
                let contactNumber:string = document.forms[0].contactNumber.value;
                let emailAddress:string = document.forms[0].emailAddress.value;

                AddContact(fullName, contactNumber, emailAddress);
            }
        });
    }

    function DisplayContactListPage(){
        console.log("Called DisplayContactList Page() ...");

        if(localStorage.length > 0) {
            let contactList = document.getElementById("contactList") as HTMLElement;
            let data = "";                           // add deserialized data from localStorage

            let keys = Object.keys(localStorage);   //  return a string array of keys

            let index = 1;
            for(const key of keys){
                let contactData = localStorage.getItem(key) as string;
                let contact: core.Contact = new core.Contact();
                contact.deserialize(contactData);
                data += `<tr><th scope="row" class="text-center">${index}</th>
                             <td>${contact.fullName}</td>
                             <td>${contact.contactNumber}</td>
                             <td>${contact.emailAddress}</td>
                             <!-- Week 4-2-->
                             <td class="text-center">
                                <button value="${key}" class="btn btn-primary btn-sm edit">
                                    <i class="fas fa-edit fa-sm"> Edit</i>
                                </button>                          
                             </td>
                             <td class="text-center">
                                <button value="${key}" class="btn btn-danger btn-sm delete">
                                    <i class="fas fa-trash-alt fa-sm"> Delete</i>
                                </button>                          
                             </td>                         
                         </tr>`
                index++;
            }
            contactList.innerHTML = data;
        }// end-if localStorage.length >0

        //week 4-2
        $("#addButton").on("click", () => {
            //UPDATE HREF
            LoadLink("edit", "add");
        });

        //must use "function" and not arrow syntax due to $this value (scope)
        $("button.delete").on("click", function (){
            //confirm delete
            if(confirm("Delete contact, are you sure?")){
                //key is passed in via the delete button
                localStorage.removeItem($(this).val() as string);
            }
            //UPDATE HREF
            LoadLink("contact-list");
        });

        //concatenate value (from edit link) to the edit.html#{key}
        $("button.edit").on("click", function() {
            //UPDATE HREF
            LoadLink("edit", $(this).val() as string);
        });

    }

    function DisplayEditPage() : void{
        console.log("Called DisplayEditPage()");

        //Week 5-2
        ContactFormValidation();

        //to view hash value of location object
        //console.log(location);
        //let page = location.hash.substring(1);
        let page = router.LinkData;

        switch(page) {
            case "add":
                //make modification to the Edit page to look like Add page
                $("main>h1").text("Add Contact");
                $("#editButton").html(`<i class="fas fa-plus-circle fa-sm"> Add`);

                $("#editButton").on("click", (event) => {
                    // prevent default submission type='submit'
                    event.preventDefault();

                    let fullName = document.forms[0].fullName.value;
                    let contactNumber = document.forms[0].contactNumber.value;
                    let emailAddress = document.forms[0].emailAddress.value;

                    AddContact(fullName, contactNumber, emailAddress);
                    //UPDATE HREF
                    LoadLink("contact-list");
                });

                $("#cancelButton").on("click", () => {
                    //UPDATE HREF
                    LoadLink("contact-list");
                });

                break;
            default: {

                let contact = new core.Contact();
                contact.deserialize(localStorage.getItem(page) as string)

                //display the contact info in the edit form
                $("#fullName").val(contact.fullName);
                $("#contactNumber").val(contact.contactNumber);
                $("#emailAddress").val(contact.emailAddress);

                //when editButton is pressed - update the contact
                $("#editButton").on("click", (event) => {

                    // prevent default submission type='submit'
                    event.preventDefault();
                    contact.fullName = $("#fullName").val() as string;
                    contact.contactNumber = $("#contactNumber").val() as string;
                    contact.emailAddress = $("#emailAddress").val() as string;

                    // replace the item in localStorage
                    localStorage.setItem(page, contact.serialize() as string);

                    //return to the contact-list
                    //UPDATE HREF
                    LoadLink("contact-list");

                });

                $("#cancelButton").on("click", () => {
                    //UPDATE HREF
                    LoadLink("contact-list");
                });

            }
                break;
        }

    }

    function DisplayLoginPage(){
        console.log("Called DisplayLoginPage()");

        let messageArea = $("messageArea");
        messageArea.hide();

        //class 9.2
        AddLinkEvents("register");

        $("#loginButton").on("click", function () {

            let success = false;
            let newUser = new core.User();

            //AJAX GET REQUEST
            // $.get(URL,data,function(data,status,xhr),dataType)
            // URL --> Required. Specifies the URL you wish to request
            // DATA --> Optional. Specifies data to send to the server along with the request
            // function() --> Optional. Specifies a function to run if the request succeeds
            // DATATYPE --> Optional. Specifies the data type expected of the server response
            $.get("./data/users.json", function (data) {

                for(const user of data.users){

                    let username:string = document.forms[0].username.value;
                    let password:string = document.forms[0].password.value;

                    console.log(data.user);
                    if(username === user.Username && password === user.Password)
                    {
                        newUser.fromJSON(user);
                        success = true;
                        break;
                    }
                }

                if(success){
                    //add user to session storage
                    sessionStorage.setItem("user", newUser.serialize() as string);
                    messageArea.removeAttr("class").hide();

                    //redirect user to secure area of the site.
                    LoadLink("contact-list");
                }else{
                    $("#username").trigger("focus").trigger("select");
                    messageArea
                        .addClass("alert alert-danger")
                        .text("Error: Invalid Login Credentials")
                        .show();
                }

            });

        });

        $("#cancelButton").on("click", function () {
            document.forms[0].reset();
            //redirect user to secure area of the site.
            LoadLink("home");
        });
    }

    function DisplayRegisterPage(){
        console.log("Called DisplayRegisterPage()");
        AddLinkEvents("login");
    }

    function Display404Page(){
        console.log("Display404Page() called ...");
    }

    function ActiveLinkCallback() : Function {
        switch(router.ActiveLink){
            case "home": return DisplayHomePage;
            case "about": return DisplayAboutUsPage;
            case "services": return DisplayServicesPage;
            case "contact": return DisplayContactUsPage;
            case "contact-list": return DisplayContactListPage;
            case "products": return DisplayProductsPage;
            case "register": return DisplayRegisterPage;
            case "login": return DisplayLoginPage;
            case "edit": return DisplayEditPage;
            case "404": return Display404Page;
            default:
                console.error("ERROR: callback does not exist: " + router.ActiveLink);
                return new Function();
        }
    }

    /**
     * Converts first letters in a string to uppercase - lowercasing the rest (pascal casing)
     * @param str
     * @returns {string}
     */
    function capitalizeFirstLetter(str:string){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function LoadHeader(){
        $.get("/views/components/header.html", function(html_data) {

            $("header").html(html_data);
            document.title = capitalizeFirstLetter(router.ActiveLink);
            //TODO: We will revisit this
            $(`li>a:contains(${document.title})`).addClass("active").attr("aria-current", "page");

            AddNavigationEvents();
            CheckLogin();
        });
    }

    function LoadContent() : void{

        let page_name:string = router.ActiveLink;
        let callback:Function = ActiveLinkCallback();

        $.get(`./views/content/${page_name}.html`, function (html_data) {

            $("main").html(html_data);

            CheckLogin();

            callback();
        });
    }

    function LoadFooter(){
        $.get("./views/components/footer.html", function(html_data) {
            $("footer").html(html_data)
        });
    }


    function Start(){
        console.log("App Started");

        LoadHeader();
        LoadLink("home");
        LoadFooter();

    }
    window.addEventListener("load", Start);


})();