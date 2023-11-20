#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>
#include <bits/stdc++.h>
#define PORT 8080

using namespace std;

#define HTML_RESP_GET "<html><head><title>Sample HTML Page</title></head><body><h1>Hello, World!</h1></body></html>"

map<string, string> db;
int id = 0;

string get_req_method(char *buffer)
{
    string method = "";
    for (int i = 0; i < 4; i++)
    {
        method += buffer[i];
    }
    if (method == "GET ")
    {
        method = "GET";
    }
    else if (method == "POST")
    {
        method = "POST";
    }
    else if (method == "PUT ")
    {
        method = "PUT";
    }
    else
    {
        method = "DELETE";
    }
    return method;
}

string get_response()
{
    return HTML_RESP_GET;
}
string post_response(string postdata)
{
    id += 1;
    db[to_string(id)] = postdata;
    string html_resp = "<html><head><title>Sample HTML Page</title></head><body>";
    for (auto i : db)
    {
        cout << i.first << ":" << i.second << endl;
        html_resp += "<li>" + i.first + ":" + i.second + "</li>";
    }
    html_resp += "</body></html>";
    return html_resp;
}
string del_response(string req_id)
{
    string parsed_id = "";
    for (char c : req_id)
    {
        if (isalnum(c))
        {
            parsed_id += c;
        }
    }
    cout<<"ID: "<<parsed_id<<endl;
    string html_resp="";
    if (db.find(parsed_id) != db.end())
    {

        db.erase(parsed_id);
        html_resp = "<html><head><title>Sample HTML Page</title></head><body>";
        for (auto i : db)
        {
            cout << i.first << ":" << i.second << endl;
            html_resp += "<li>" + i.first + ":" + i.second + "</li>";
        }
        html_resp += "</body></html>";
    }
    return html_resp;
}

string get_req_data(char *buffer)
{
    const char *token = "\r\n\r\n";
    char *part = strtok(buffer, token);
    int cnt = 0;
    string data = "";
    while (part != nullptr)
    {
        // cout << "Part: " << part <<":"<<cnt<<endl;
        if (cnt >= 9 && part != nullptr)
        {
            for (int i = 0; i < strlen(part); i++)
            {
                data += part[i];
            }
            data += '\n';
        }

        part = strtok(nullptr, token);
        cnt += 1;
    }
    string final_data = "";
    for (int i = data.length() - 1; i >= 0; i--)
    {
        final_data += data[i];
        if (data[i] == '{')
        {
            break;
        }
    }
    reverse(final_data.begin(), final_data.end());

    return final_data;
}

string handle_req(char *buffer)
{
    string method = get_req_method(buffer);
    string resp = "";
    if (method == "GET")
    {
        resp = get_response();
    }
    else if (method == "POST")
    {
        string data = get_req_data(buffer);
        cout << "REQ DATA: " << data << endl;
        resp = post_response(data);
    }
    else
    {
        string data = get_req_data(buffer);
        cout << "REQ DATA: " << data << endl;
        resp = del_response(data);
    }
    return resp;
}

int main()
{
    int server_desc, new_socket, valread;
    struct sockaddr_in address;
    int addrlen = sizeof(address);

    if ((server_desc = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (bind(server_desc, (struct sockaddr *)&address, sizeof(address)) < 0)
    {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_desc, 3) < 0)
    {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    while (1)
    {
        if ((new_socket = accept(server_desc, (struct sockaddr *)&address, (socklen_t *)&addrlen)) < 0)
        {
            perror("accept");
            exit(EXIT_FAILURE);
        }

        char buffer[1024] = {0};
        valread = read(new_socket, buffer, 1024);

        printf("Received: %s\n", buffer);
        std::stringstream response;
        string dynamicContent = handle_req(buffer);
        if (dynamicContent != "")
        {
            response << "HTTP/1.1 200 OK\r\n";
            response << "Connection: keep-alive\r\n";
            response << "Content-Type: text/plain\r\n";
            response << "Access-Control-Allow-Origin: http://127.0.0.1:5500\r\n";
            response << "Content-Length: " << dynamicContent.length() << "\r\n";
            response << "\r\n";
            response << dynamicContent;
        }
        else
        {
            dynamicContent="<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>";
            response << "HTTP/1.1 404 Not Found\r\n";
            response << "Connection: keep-alive\r\n";
            response << "Content-Type: text/plain\r\n";
            response << "Access-Control-Allow-Origin: http://127.0.0.1:5500\r\n";
            response << "Content-Length: " << 0 << "\r\n";
            response << "\r\n";
            response << dynamicContent;
        }

        send(new_socket, response.str().c_str(), response.str().size(), 0);
        printf("Response sent\n");

        // Close the connection after sending the response
        close(new_socket);
    }

    // Close the listening socket
    close(server_desc);

    return 0;
}
