/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

grammar gestaomusicos;

banda: 'BANDA:' nome musicos EOF
     ;

musicos : (musico)* 
        ;

musico : 'MUSICO:'
         'NOME:' nome 
         ('INSTRUMENTO:' instrumento)+
       ;

nome : TEXTO ;

instrumento : TEXTO ;


NUMERO   : [0-9]+ ; 
TEXTO    : (LETRA)+(' '(LETRA)+)* ;

Separador: ('\r'? '\n' | ' ' | '\t')+  -> skip ;

// LETRA não é um terminal. Simplesmente foi definido para simplificar outras expressões regulares.
fragment LETRA : [a-zA-ZáéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕàèìòùÀÈÌÒÙçÇ_] ;
